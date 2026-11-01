import JSZip from 'jszip'
import xmind from 'simple-mind-map/src/parse/xmind.js'
import { describe, expect, it } from 'vitest'
import { importedTreeToMap, InvalidMapFileError, newMapData, parseMapFile, plainTextToRichHtml, serializeMap, SMM_VERSION } from './data'

describe('map file (FILE-01)', () => {
  it('round-trips through serialize / parse and keeps smmVersion', () => {
    const data = newMapData('Central Topic')
    data.root.children = [{ data: { text: '<p>run <code>kubectl</code></p>', richText: true }, children: [] }]
    const parsed = parseMapFile(serializeMap(data))
    expect(parsed).toEqual(data)
    expect(parsed.root.smmVersion).toBe(SMM_VERSION)
  })

  it('adds smmVersion when missing, so rich text styles are not stripped on load', () => {
    const parsed = parseMapFile(JSON.stringify({ root: { data: { text: '<p><b>x</b></p>', richText: true } } }))
    expect(parsed.root.smmVersion).toBe(SMM_VERSION)
    expect(parsed.layout).toBe('logicalStructure')
  })

  it('rejects data without a root node', () => {
    expect(() => parseMapFile('{"foo":1}')).toThrow(InvalidMapFileError)
  })
})

describe('new map (MAP-01)', () => {
  it('uses the right-growing logical structure layout', () => {
    expect(newMapData('Central Topic').layout).toBe('logicalStructure')
  })
})

describe('plain text import', () => {
  it('keeps line breaks and leading indentation', () => {
    expect(plainTextToRichHtml('a:\n  b: <1>\n\nc')).toBe('<p>a:</p><p>&nbsp;&nbsp;b: &lt;1&gt;</p><p><br></p><p>c</p>')
  })
})

describe('xmind import (FILE-04)', () => {
  it('imports the topic tree and multi-line text from content.json', async () => {
    const content = [
      {
        title: 'Sheet',
        rootTopic: {
          title: 'K8s',
          children: {
            attached: [
              { title: 'pod', children: { attached: [{ title: 'apiVersion: v1\nkind: Pod' }] } },
              { title: 'replicaset' },
            ],
          },
        },
      },
    ]
    const zip = new JSZip()
    zip.file('content.json', JSON.stringify(content))
    const blob = await zip.generateAsync({ type: 'blob' })

    const map = importedTreeToMap(await xmind.parseXmindFile(blob))

    expect(map.layout).toBe('logicalStructure')
    expect(map.root.smmVersion).toBe(SMM_VERSION)
    expect(map.root.data.text).toBe('<p>K8s</p>')
    expect(map.root.children?.map(c => c.data.text)).toEqual(['<p>pod</p>', '<p>replicaset</p>'])
    expect(map.root.children?.[0].children?.[0].data.text).toBe('<p>apiVersion: v1</p><p>kind: Pod</p>')
  })
})
