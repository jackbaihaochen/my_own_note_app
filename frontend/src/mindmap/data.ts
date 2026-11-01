import pkg from 'simple-mind-map/package.json'
import type { NodeTree } from 'simple-mind-map'

// RichText strips every inline style from data whose root lacks smmVersion (or is older
// than 0.13.0), so every tree we hand to the library must carry the current version.
export const SMM_VERSION = pkg.version

export const FILE_EXTENSION = '.mindmap.json'

export interface MapFile {
  layout: string
  root: NodeTree
  theme: { template: string; config: Record<string, unknown> }
  view: unknown
}

function mapWithRoot(root: NodeTree): MapFile {
  return { layout: 'logicalStructure', root, theme: { template: 'default', config: {} }, view: null }
}

// `rootText` is the central topic's text in the current UI language
export function newMapData(rootText: string): MapFile {
  return mapWithRoot({ data: { text: `<p>${rootText}</p>`, richText: true }, children: [], smmVersion: SMM_VERSION })
}

export function ensureVersion(data: MapFile): MapFile {
  if (!data.root.smmVersion) data.root.smmVersion = SMM_VERSION
  return data
}

export function serializeMap(data: MapFile): string {
  return JSON.stringify(ensureVersion(data), null, 2)
}

// Thrown for JSON that isn't a map; the UI shows its own localized message for it
export class InvalidMapFileError extends Error {}

export function parseMapFile(text: string): MapFile {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !data.root?.data) {
    throw new InvalidMapFileError('not a mind map file')
  }
  return ensureVersion({ layout: 'logicalStructure', theme: { template: 'default', config: {} }, view: null, ...data })
}

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// One <p> per line; leading spaces become &nbsp; so indentation survives HTML whitespace collapsing.
export function plainTextToRichHtml(text: string): string {
  return text
    .split(/\r?\n/)
    .map(line => {
      if (!line) return '<p><br></p>'
      const html = escapeHtml(line).replace(/^ +/, m => '&nbsp;'.repeat(m.length))
      return `<p>${html}</p>`
    })
    .join('')
}

// Imported trees (e.g. from .xmind) hold plain text; the library would wrap it in a single
// <p> and lose line breaks, so convert it to rich text ourselves.
export function importedTreeToMap(root: NodeTree): MapFile {
  const walk = (node: NodeTree) => {
    if (!node.data.richText && typeof node.data.text === 'string') {
      node.data.text = plainTextToRichHtml(node.data.text)
      node.data.richText = true
    }
    node.children?.forEach(walk)
  }
  walk(root)
  root.smmVersion = SMM_VERSION
  return mapWithRoot(root)
}
