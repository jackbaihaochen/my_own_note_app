import type Quill from 'quill'
import MindMap from 'simple-mind-map'
import Drag from 'simple-mind-map/src/plugins/Drag.js'
import KeyboardNavigation from 'simple-mind-map/src/plugins/KeyboardNavigation.js'
import MiniMap from 'simple-mind-map/src/plugins/MiniMap.js'
import NodeImgAdjust from 'simple-mind-map/src/plugins/NodeImgAdjust.js'
import RichText from 'simple-mind-map/src/plugins/RichText.js'
import type { MapFile } from './data'
import { highlightCodeBlocks, QUILL_SYNTAX_OPTIONS } from './highlight'

MindMap.usePlugin(RichText, { syntax: QUILL_SYNTAX_OPTIONS })
  .usePlugin(Drag)
  .usePlugin(KeyboardNavigation)
  .usePlugin(NodeImgAdjust)
  .usePlugin(MiniMap)

function isEditingCodeBlock(mindMap: MindMap) {
  const quill = mindMap.richText?.showTextEdit ? mindMap.richText.quill : null
  return Boolean(quill?.getFormat()['code-block'])
}

const FONT ='-apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", sans-serif'

export function createMindMap(el: HTMLElement, data: MapFile): MindMap {
  const mindMap = new MindMap({
    el,
    data: data.root,
    layout: data.layout,
    theme: data.theme.template,
    themeConfig: {
      ...data.theme.config,
      root: { fontFamily: FONT },
      second: { fontFamily: FONT },
      node: { fontFamily: FONT },
    },
    viewData: data.view,
    // Trackpad two-finger scroll pans; pinch (ctrl+wheel) zooms
    mousewheelAction: 'move',
    // Pixel-mode wheel events pan by their real distance instead of a fixed 100px step;
    // the library's default guess (|deltaY| <= 10) misreads fast trackpad swipes.
    customCheckIsTouchPad: (e: WheelEvent) => e.deltaMode === WheelEvent.DOM_DELTA_PIXEL,
    // While editing, the library binds Tab to "finish editing". Inside a code block Tab must
    // only indent (Quill's own binding has already handled it), so skip the shortcut there.
    beforeShortcutRun: (key: string) => key === 'Tab' && isEditingCodeBlock(mindMap),
    // The library saves the editor's raw innerHTML; strip the syntax module's editor-only
    // markup (highlight tokens, language <select>) so stored data stays plain code blocks.
    beforeHideRichTextEdit: (richText: { quill: Quill }) => {
      const root = richText.quill.root
      root.querySelectorAll('.ql-ui').forEach(el => el.remove())
      root.querySelectorAll('.ql-token').forEach(el => el.replaceWith(...el.childNodes))
    },
  })

  mindMap.keyCommand.addShortcut('Control+Shift+z', () => mindMap.execCommand('FORWARD'))
  mindMap.keyCommand.addShortcut('Spacebar', () => {
    const node = mindMap.renderer.activeNodeList[0]
    if (node) mindMap.renderer.textEdit.show({ node })
  })
  mindMap.on('node_tree_render_end', () => highlightCodeBlocks(el))

  // Links inside nodes open only on Cmd+click, so a plain click still just selects the node
  el.addEventListener(
    'click',
    event => {
      const link = (event.target as Element).closest?.('.smm-richtext-node-wrap a') as HTMLAnchorElement | null
      if (!link) return
      event.preventDefault()
      if (event.metaKey || event.ctrlKey) window.open(link.href, '_blank', 'noopener')
    },
    true,
  )

  return mindMap
}
