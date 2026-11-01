// simple-mind-map ships plain JS without type declarations; only the parts we use are typed.

declare module 'simple-mind-map' {
  import type Quill from 'quill'

  export interface NodeTreeData {
    text?: string
    richText?: boolean
    [key: string]: unknown
  }

  export interface NodeTree {
    data: NodeTreeData
    children?: NodeTree[]
    smmVersion?: string
  }

  export interface MindMapNode {
    getData(key: string): unknown
  }

  export interface RichTextPlugin {
    quill: Quill | null
    textEditNode: HTMLElement | null
    showTextEdit: boolean
  }

  export interface MiniMapState {
    svgHTML: string
    viewBoxStyle: { left: string; right: string; top: string; bottom: string }
    miniMapBoxScale: number
    miniMapBoxLeft: number
    miniMapBoxTop: number
  }

  export interface MiniMapPlugin {
    calculationMiniMap(width: number, height: number): MiniMapState
    onViewBoxMousedown(e: MouseEvent): void
    onViewBoxMousemove(e: MouseEvent): void
    onMouseup(): void
  }

  export default class MindMap {
    constructor(options: Record<string, unknown>)
    static usePlugin(plugin: unknown, opt?: Record<string, unknown>): typeof MindMap
    el: HTMLElement
    richText?: RichTextPlugin
    miniMap: MiniMapPlugin
    view: { translateX(step: number): void; translateY(step: number): void }
    renderer: {
      activeNodeList: MindMapNode[]
      textEdit: { show(opt: { node: MindMapNode }): void; hideEditTextBox(): void }
    }
    keyCommand: { addShortcut(key: string, fn: () => void): void }
    on(event: string, fn: (...args: any[]) => void): void
    off(event: string, fn: (...args: any[]) => void): void
    execCommand(name: string, ...args: unknown[]): void
    getData(withConfig?: boolean): any
    setFullData(data: unknown): void
    updateConfig(opt: Record<string, unknown>): void
    destroy(): void
  }
}

declare module 'simple-mind-map/src/plugins/RichText.js' {
  const plugin: unknown
  export default plugin
}
declare module 'simple-mind-map/src/plugins/Drag.js' {
  const plugin: unknown
  export default plugin
}
declare module 'simple-mind-map/src/plugins/KeyboardNavigation.js' {
  const plugin: unknown
  export default plugin
}
declare module 'simple-mind-map/src/plugins/MiniMap.js' {
  const plugin: unknown
  export default plugin
}
declare module 'simple-mind-map/src/plugins/NodeImgAdjust.js' {
  const plugin: unknown
  export default plugin
}
declare module 'simple-mind-map/src/parse/xmind.js' {
  import type { NodeTree } from 'simple-mind-map'
  const xmind: { parseXmindFile(file: Blob): Promise<NodeTree> }
  export default xmind
}
declare module 'simple-mind-map/package.json' {
  const pkg: { version: string }
  export default pkg
}

// File System Access API (Chromium only, not yet in lib.dom)
interface FilePickerAcceptType {
  description?: string
  accept: Record<string, string[]>
}
interface Window {
  showOpenFilePicker(options?: { types?: FilePickerAcceptType[]; multiple?: boolean }): Promise<FileSystemFileHandle[]>
  showSaveFilePicker(options?: { suggestedName?: string; types?: FilePickerAcceptType[] }): Promise<FileSystemFileHandle>
}

interface FileSystemHandle {
  queryPermission(descriptor?: { mode?: 'read' | 'readwrite' }): Promise<PermissionState>
  requestPermission(descriptor?: { mode?: 'read' | 'readwrite' }): Promise<PermissionState>
}
