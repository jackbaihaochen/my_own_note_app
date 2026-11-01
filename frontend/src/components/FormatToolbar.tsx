import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type MindMap from 'simple-mind-map'
import type Quill from 'quill'
import type { Messages } from '../i18n'
import { CODE_LANGUAGES } from '../mindmap/highlight'

const COLORS = ['#000000', '#e03131', '#f08c00', '#2f9e44', '#1971c2', '#9c36b5', '#868e96']
const SIZES = ['12px', '14px', '16px', '20px', '24px', '32px']

type Formats = Record<string, unknown>

function currentQuill(mindMap: MindMap): Quill | null {
  return mindMap.richText?.showTextEdit ? mindMap.richText.quill : null
}

export function toggleInlineCode(quill: Quill) {
  quill.format('code', !quill.getFormat().code, 'user')
}

// Apply a code-block value to every line of the block the cursor is in.
function setCodeBlockLanguage(quill: Quill, language: string) {
  const range = quill.getSelection(true)
  const [line] = quill.getLine(range.index)
  const container = line?.parent
  if (!container) return
  container.children.forEach((child: any) => {
    quill.formatLine(quill.getIndex(child), 1, 'code-block', language, 'user')
  })
  // the syntax module only re-highlights when the text changes, so force it for a language switch
  ;(quill.getModule('syntax') as { highlight(blot: unknown, force: boolean): void } | undefined)?.highlight(container, true)
}

export function FormatToolbar({ mindMap, t }: { mindMap: MindMap; t: Messages }) {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [formats, setFormats] = useState<Formats>({})
  const toolbarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const refresh = () => {
      const quill = currentQuill(mindMap)
      const editEl = mindMap.richText?.textEditNode
      if (!quill || !editEl) {
        setRect(null)
        return
      }
      setRect(editEl.getBoundingClientRect())
      setFormats(quill.getFormat())
    }
    const hide = () => setRect(null)
    // the edit box is created during show, so wait a frame before measuring it
    const onShow = () => requestAnimationFrame(refresh)
    mindMap.on('before_show_text_edit', onShow)
    mindMap.on('rich_text_selection_change', refresh)
    mindMap.on('node_text_edit_change', refresh)
    mindMap.on('hide_text_edit', hide)
    return () => {
      mindMap.off('before_show_text_edit', onShow)
      mindMap.off('rich_text_selection_change', refresh)
      mindMap.off('node_text_edit_change', refresh)
      mindMap.off('hide_text_edit', hide)
    }
  }, [mindMap])

  // keep the toolbar inside the window when the edited node sits near the right edge
  useLayoutEffect(() => {
    const el = toolbarRef.current
    if (!el || !rect) return
    const { width, height } = el.getBoundingClientRect()
    el.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - width - 8))}px`
    el.style.top = `${Math.max(4, rect.top - height - 6)}px`
  })

  if (!rect) return null

  const run = (fn: (quill: Quill) => void) => {
    const quill = currentQuill(mindMap)
    if (!quill) return
    fn(quill)
    setFormats(quill.getFormat())
  }
  const toggle = (name: string) => run(q => q.format(name, !q.getFormat()[name], 'user'))
  const inCodeBlock = Boolean(formats['code-block'])
  const codeLanguage = typeof formats['code-block'] === 'string' ? formats['code-block'] : 'plain'

  return (
    <div
      ref={toolbarRef}
      className="format-toolbar"
      // keep focus (and the selection) inside the editor while clicking buttons, and keep the
      // library from treating the click as an outside click that ends editing
      onMouseDown={e => {
        e.stopPropagation()
        if (!(e.target instanceof HTMLSelectElement)) e.preventDefault()
      }}
    >
      <button className={formats.bold ? 'on' : ''} title={t.bold} onClick={() => toggle('bold')}>
        <b>B</b>
      </button>
      <button className={formats.italic ? 'on' : ''} title={t.italic} onClick={() => toggle('italic')}>
        <i>I</i>
      </button>
      <button className={formats.underline ? 'on' : ''} title={t.underline} onClick={() => toggle('underline')}>
        <u>U</u>
      </button>
      <button className={formats.strike ? 'on' : ''} title={t.strike} onClick={() => toggle('strike')}>
        <s>S</s>
      </button>
      <span className="sep" />
      {COLORS.map(color => (
        <button
          key={color}
          className="swatch"
          title={color}
          style={{ background: color }}
          onClick={() => run(q => q.format('color', color === '#000000' ? false : color, 'user'))}
        />
      ))}
      <select
        title={t.fontSize}
        value={typeof formats.size === 'string' ? formats.size : ''}
        onChange={e => run(q => q.format('size', e.target.value || false, 'user'))}
      >
        <option value="">{t.fontSize}</option>
        {SIZES.map(size => (
          <option key={size} value={size}>
            {parseInt(size)}
          </option>
        ))}
      </select>
      <span className="sep" />
      <button className={formats.code ? 'on' : ''} title={t.inlineCode} onClick={() => run(toggleInlineCode)}>
        {'</>'}
      </button>
      <button
        className={inCodeBlock ? 'on' : ''}
        title={t.codeBlock}
        onClick={() =>
          run(q => {
            const range = q.getSelection(true)
            q.formatLine(range.index, range.length, 'code-block', inCodeBlock ? false : 'plain', 'user')
          })
        }
      >
        {'{ }'}
      </button>
      {inCodeBlock && (
        <select title={t.codeLanguage} value={codeLanguage} onChange={e => run(q => setCodeBlockLanguage(q, e.target.value))}>
          <option value="plain">{t.plainCode}</option>
          {CODE_LANGUAGES.map(lang => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      )}
      <button
        className={formats.link ? 'on' : ''}
        title={t.link}
        onClick={() =>
          run(q => {
            const url = window.prompt(t.linkPrompt, typeof formats.link === 'string' ? formats.link : 'https://')
            if (url === null) return
            q.format('link', url.trim() || false, 'user')
          })
        }
      >
        🔗
      </button>
      <button title={t.clearFormat} onClick={() => run(q => {
        const range = q.getSelection(true)
        q.removeFormat(range.index, range.length, 'user')
      })}>
        ⌫
      </button>
    </div>
  )
}
