import { useCallback, useEffect, useRef, useState } from 'react'
import type MindMap from 'simple-mind-map'
import xmind from 'simple-mind-map/src/parse/xmind.js'
import { FormatToolbar, toggleInlineCode } from './components/FormatToolbar'
import { MiniMapPanel } from './components/MiniMapPanel'
import { pickMapFile, pickSaveTarget, pickXmindFile, readAsDataUrl, writeFile } from './file/fileAccess'
import { createMindMap } from './mindmap/createMindMap'
import { FILE_EXTENSION, importedTreeToMap, newMapData, parseMapFile, serializeMap, type MapFile } from './mindmap/data'

const UNTITLED = '未命名'
const MAX_IMAGE_WIDTH = 300

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mindMapRef = useRef<MindMap | null>(null)
  const [mindMap, setMindMap] = useState<MindMap | null>(null)
  const [fileName, setFileName] = useState(UNTITLED)
  const [dirty, setDirty] = useState(false)
  const handleRef = useRef<FileSystemFileHandle | null>(null)
  // Dirty = node data differs from the snapshot taken after the last load / save
  const baselineRef = useRef<string | null>(null)

  const snapshot = () => JSON.stringify(mindMapRef.current?.getData(false))

  // `unsaved`: the loaded map has no saved copy yet (e.g. an import), so it starts dirty
  const resetBaselineAfterRender = (mm: MindMap, unsaved = false) => {
    baselineRef.current = null
    const onRendered = () => {
      mm.off('node_tree_render_end', onRendered)
      baselineRef.current = unsaved ? '' : snapshot()
      setDirty(unsaved)
    }
    mm.on('node_tree_render_end', onRendered)
  }

  useEffect(() => {
    const el = containerRef.current!
    let mm: MindMap | null = null
    // In the production build the stylesheet can apply after this runs, leaving the container
    // 0×0 (the library refuses that), so create the map once the container has a size
    const observer = new ResizeObserver(() => {
      if (mm || !el.clientWidth || !el.clientHeight) return
      observer.disconnect()
      mm = createMindMap(el, newMapData())
      mindMapRef.current = mm
      resetBaselineAfterRender(mm)
      mm.on('data_change', () => {
        if (baselineRef.current !== null) setDirty(snapshot() !== baselineRef.current)
      })
      setMindMap(mm)
      // handle for inspecting the map from the browser console during development
      if (import.meta.env.DEV) Object.assign(window, { mindMap: mm })
    })
    observer.observe(el)
    return () => {
      observer.disconnect()
      mm?.destroy()
    }
  }, [])

  const loadMap = useCallback((data: MapFile, name: string, handle: FileSystemFileHandle | null, unsaved = false) => {
    const mm = mindMapRef.current!
    resetBaselineAfterRender(mm, unsaved)
    mm.setFullData(data)
    handleRef.current = handle
    setFileName(name)
  }, [])

  const confirmDiscard = () => !dirty || window.confirm('当前导图有未保存的修改，确定放弃吗？')

  const newMap = () => {
    if (confirmDiscard()) loadMap(newMapData(), UNTITLED, null)
  }

  const openMap = async () => {
    if (!confirmDiscard()) return
    const picked = await pickMapFile()
    if (!picked) return
    try {
      loadMap(parseMapFile(picked.text), picked.handle.name, picked.handle)
    } catch (e) {
      window.alert(`打开失败：${(e as Error).message}`)
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
      window.alert(`导入失败：${(e as Error).message}`)
    }
  }

  const save = async (saveAs: boolean) => {
    const mm = mindMapRef.current!
    let handle = handleRef.current
    if (!handle || saveAs) {
      const base = fileName.endsWith(FILE_EXTENSION) ? fileName : fileName + FILE_EXTENSION
      handle = await pickSaveTarget(base)
      if (!handle) return
    }
    try {
      await writeFile(handle, serializeMap(mm.getData(true)))
    } catch (e) {
      window.alert(`保存失败：${(e as Error).message}`)
      return
    }
    handleRef.current = handle
    setFileName(handle.name)
    baselineRef.current = snapshot()
    setDirty(false)
  }

  const insertImage = async () => {
    const mm = mindMapRef.current!
    const node = mm.renderer.activeNodeList[0]
    if (!node) {
      window.alert('请先选中一个节点')
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

  // Keep the latest handlers reachable from the one-time key listener
  const actions = useRef({ openMap, save })
  useEffect(() => {
    actions.current = { openMap, save }
  })

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
    document.title = `${dirty ? '● ' : ''}${fileName}`
    if (!dirty) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty, fileName])

  return (
    <div className="app">
      <header className="topbar">
        <span className="file-name">
          {fileName}
          {dirty && <span className="dirty" title="未保存"> ●</span>}
        </span>
        <button onClick={newMap}>新建</button>
        <button onClick={openMap} title="⌘O">打开</button>
        <button onClick={() => save(false)} title="⌘S">保存</button>
        <button onClick={() => save(true)} title="⇧⌘S">另存为</button>
        <button onClick={importXmind}>导入 XMind</button>
        <span className="sep" />
        <button onClick={insertImage}>插入图片</button>
      </header>
      <div className="canvas" ref={containerRef} />
      {mindMap && <FormatToolbar mindMap={mindMap} />}
      {mindMap && <MiniMapPanel mindMap={mindMap} />}
    </div>
  )
}
