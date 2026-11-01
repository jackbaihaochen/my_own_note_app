import { useCallback, useEffect, useRef, useState } from 'react'
import type MindMap from 'simple-mind-map'
import xmind from 'simple-mind-map/src/parse/xmind.js'
import { FormatToolbar, toggleInlineCode } from './components/FormatToolbar'
import { MiniMapPanel } from './components/MiniMapPanel'
import { loadDraft, saveDraft, type Draft } from './file/draftStore'
import {
  ensureWritePermission,
  fileLastModified,
  pickMapFile,
  pickSaveTarget,
  pickXmindFile,
  readAsDataUrl,
  writeFile,
} from './file/fileAccess'
import { LANGUAGES, loadLang, messages, saveLang, type Lang } from './i18n'
import { createMindMap, topicTextConfig } from './mindmap/createMindMap'
import {
  FILE_EXTENSION,
  importedTreeToMap,
  InvalidMapFileError,
  newMapData,
  parseMapFile,
  serializeMap,
  type MapFile,
} from './mindmap/data'

const MAX_IMAGE_WIDTH = 300
// Drafts saved before the UI was localized stored this placeholder as an untitled map's name
const LEGACY_UNTITLED = '未命名'

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mindMapRef = useRef<MindMap | null>(null)
  const [mindMap, setMindMap] = useState<MindMap | null>(null)
  const [lang, setLang] = useState<Lang>(loadLang)
  const t = messages[lang]
  // '' = untitled; shown as `t.untitled` so it follows the UI language
  const [fileName, setFileName] = useState('')
  const [dirty, setDirty] = useState(false)
  const handleRef = useRef<FileSystemFileHandle | null>(null)
  // Mirrors of state the browser draft needs, readable from event handlers
  const fileNameRef = useRef('')
  const tRef = useRef(t)
  const fileModifiedRef = useRef<number | null>(null)
  // Dirty = node data differs from the snapshot taken after the last load / save
  const baselineRef = useRef<string | null>(null)
  const draftWriteRef = useRef({ busy: false, again: false })
  const draftErrorShownRef = useRef(false)

  // These only read refs, so they are stable for the component's lifetime
  const snapshot = useCallback(() => JSON.stringify(mindMapRef.current?.getData(false)), [])

  // Write the current map to the browser draft right away (FILE-05). Not debounced and not left to
  // page close: writes started while a page unloads don't reliably land. Changes arriving during a
  // write are folded into one more write afterwards.
  const persistDraft = useCallback(function persist() {
    const write = draftWriteRef.current
    if (write.busy) {
      write.again = true
      return
    }
    const mm = mindMapRef.current
    if (!mm || baselineRef.current === null) return
    write.busy = true
    saveDraft({
      text: serializeMap(mm.getData(true)),
      name: fileNameRef.current,
      handle: handleRef.current,
      fileModified: fileModifiedRef.current,
      dirty: snapshot() !== baselineRef.current,
    })
      .catch(e => {
        if (draftErrorShownRef.current) return
        draftErrorShownRef.current = true
        window.alert(tRef.current.draftSaveFailed((e as Error).message))
      })
      .finally(() => {
        write.busy = false
        if (write.again) {
          write.again = false
          persist()
        }
      })
  }, [snapshot])

  // `unsaved`: the loaded map has no saved copy yet (e.g. an import), so it starts dirty
  const resetBaselineAfterRender = useCallback(
    (mm: MindMap, unsaved = false) => {
      baselineRef.current = null
      const onRendered = () => {
        mm.off('node_tree_render_end', onRendered)
        baselineRef.current = unsaved ? '' : snapshot()
        setDirty(unsaved)
        persistDraft()
      }
      mm.on('node_tree_render_end', onRendered)
    },
    [snapshot, persistDraft],
  )

  useEffect(() => {
    const el = containerRef.current!
    let mm: MindMap | null = null
    let disposed = false
    const draftLoaded = loadDraft().catch(() => null)

    const start = (draft: Draft | null) => {
      if (disposed) return
      const t = tRef.current
      mm = createMindMap(el, draft ? parseMapFile(draft.text) : newMapData(t.rootTopic), t)
      mindMapRef.current = mm
      if (draft) {
        const name = draft.name === LEGACY_UNTITLED ? '' : draft.name
        handleRef.current = draft.handle
        fileModifiedRef.current = draft.fileModified
        fileNameRef.current = name
        setFileName(name)
      }
      resetBaselineAfterRender(mm, draft?.dirty)
      mm.on('data_change', () => {
        if (baselineRef.current === null) return
        setDirty(snapshot() !== baselineRef.current)
        persistDraft()
      })
      setMindMap(mm)
      // handle for inspecting the map from the browser console during development
      if (import.meta.env.DEV) Object.assign(window, { mindMap: mm })
    }

    // In the production build the stylesheet can apply after this runs, leaving the container
    // 0×0 (the library refuses that), so create the map once the container has a size
    const observer = new ResizeObserver(() => {
      if (!el.clientWidth || !el.clientHeight) return
      observer.disconnect()
      draftLoaded.then(start)
    })
    observer.observe(el)
    return () => {
      disposed = true
      observer.disconnect()
      mm?.destroy()
    }
  }, [snapshot, persistDraft, resetBaselineAfterRender])

  const loadMap = useCallback(
    (data: MapFile, name: string, handle: FileSystemFileHandle | null, unsaved = false, fileModified: number | null = null) => {
      const mm = mindMapRef.current!
      resetBaselineAfterRender(mm, unsaved)
      mm.setFullData(data)
      handleRef.current = handle
      fileModifiedRef.current = fileModified
      fileNameRef.current = name
      setFileName(name)
    },
    [resetBaselineAfterRender],
  )

  const confirmDiscard = () => !dirty || window.confirm(t.discardChanges)

  const newMap = () => {
    if (confirmDiscard()) loadMap(newMapData(t.rootTopic), '', null)
  }

  const openMap = async () => {
    if (!confirmDiscard()) return
    const picked = await pickMapFile(t.mindMapFileType)
    if (!picked) return
    try {
      loadMap(parseMapFile(picked.text), picked.handle.name, picked.handle, false, picked.lastModified)
    } catch (e) {
      window.alert(t.openFailed(e instanceof InvalidMapFileError ? t.invalidMapFile : (e as Error).message))
    }
  }

  const importXmind = async () => {
    if (!confirmDiscard()) return
    const file = await pickXmindFile()
    if (!file) return
    try {
      const root = await xmind.parseXmindFile(file)
      loadMap(importedTreeToMap(root), file.name.replace(/\.xmind$/, ''), null, true)
    } catch (e) {
      window.alert(t.importFailed((e as Error).message))
    }
  }

  const save = async (saveAs: boolean) => {
    const mm = mindMapRef.current!
    let handle = handleRef.current
    if (!handle || saveAs) {
      const name = fileName || t.untitled
      handle = await pickSaveTarget(name.endsWith(FILE_EXTENSION) ? name : name + FILE_EXTENSION, t.mindMapFileType)
      if (!handle) return
    }
    try {
      if (handle === handleRef.current) {
        if (!(await ensureWritePermission(handle))) return
        // FILE-06: don't silently overwrite edits made to the file elsewhere (e.g. synced from another computer)
        const known = fileModifiedRef.current
        if (
          known !== null &&
          (await fileLastModified(handle)) > known &&
          !window.confirm(t.fileChangedElsewhere(handle.name))
        )
          return
      }
      await writeFile(handle, serializeMap(mm.getData(true)))
      fileModifiedRef.current = await fileLastModified(handle)
    } catch (e) {
      window.alert(t.saveFailed((e as Error).message))
      return
    }
    handleRef.current = handle
    fileNameRef.current = handle.name
    setFileName(handle.name)
    baselineRef.current = snapshot()
    setDirty(false)
    persistDraft()
  }

  const insertImage = async () => {
    const mm = mindMapRef.current!
    const node = mm.renderer.activeNodeList[0]
    if (!node) {
      window.alert(t.selectNodeFirst)
      return
    }
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      const url = await readAsDataUrl(file)
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, MAX_IMAGE_WIDTH / img.naturalWidth)
        mm.execCommand('SET_NODE_IMAGE', node, {
          url,
          title: '',
          width: Math.round(img.naturalWidth * scale),
          height: Math.round(img.naturalHeight * scale),
        })
      }
      img.src = url
    }
    input.click()
  }

  // Keep the latest handlers and texts reachable from one-time listeners
  const actions = useRef({ openMap, save })
  useEffect(() => {
    actions.current = { openMap, save }
    tRef.current = t
  })

  // UI-02: switching language takes effect at once; existing map content is left as it is
  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
    mindMap?.updateConfig(topicTextConfig(messages[lang]))
  }, [lang, mindMap])

  const changeLang = (next: Lang) => {
    setLang(next)
    saveLang(next)
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mindMapRef.current?.richText?.showTextEdit) {
        mindMapRef.current.renderer.textEdit.hideEditTextBox()
        return
      }
      if (!(e.metaKey || e.ctrlKey)) return
      const key = e.key.toLowerCase()
      if (key === 's') {
        e.preventDefault()
        actions.current.save(e.shiftKey)
      } else if (key === 'o') {
        e.preventDefault()
        actions.current.openMap()
      } else if (key === 'e') {
        const quill = mindMapRef.current?.richText?.showTextEdit ? mindMapRef.current.richText.quill : null
        if (quill) {
          e.preventDefault()
          toggleInlineCode(quill)
        }
      }
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [])

  useEffect(() => {
    // No leave-page prompt: the browser draft keeps unsaved edits (FILE-03 / FILE-05)
    document.title = `${dirty ? '● ' : ''}${fileName || t.untitled}`
  }, [dirty, fileName, t])

  return (
    <div className="app">
      <header className="topbar">
        <span className="file-name">
          {fileName || t.untitled}
          {dirty && <span className="dirty" title={t.unsaved}> ●</span>}
        </span>
        <button onClick={newMap}>{t.newMap}</button>
        <button onClick={openMap} title="⌘O">
          {t.open}
        </button>
        <button onClick={() => save(false)} title="⌘S">
          {t.save}
        </button>
        <button onClick={() => save(true)} title="⇧⌘S">
          {t.saveAs}
        </button>
        <button onClick={importXmind}>{t.importXmind}</button>
        <span className="sep" />
        <button onClick={insertImage}>{t.insertImage}</button>
        <select className="lang-select" title={t.language} value={lang} onChange={e => changeLang(e.target.value as Lang)}>
          {LANGUAGES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </header>
      <div className="canvas" ref={containerRef} />
      {mindMap && <FormatToolbar mindMap={mindMap} t={t} />}
      {mindMap && <MiniMapPanel mindMap={mindMap} t={t} />}
    </div>
  )
}
