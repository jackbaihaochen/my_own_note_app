import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { newMapData, serializeMap } from '../mindmap/data'
import { loadDraft, saveDraft, type Draft } from './draftStore'

describe('draftStore', () => {
  it('returns null when nothing has been saved', async () => {
    expect(await loadDraft()).toBeNull()
  })

  it('reads back the last saved draft', async () => {
    const first: Draft = { text: serializeMap(newMapData()), name: '未命名', handle: null, fileModified: null, dirty: true }
    const second: Draft = { ...first, name: 'notes.mindmap.json', fileModified: 1730000000000, dirty: false }
    await saveDraft(first)
    await saveDraft(second)
    expect(await loadDraft()).toEqual(second)
  })
})
