import { FILE_EXTENSION } from '../mindmap/data'

const MAP_TYPES = [{ description: '思维导图', accept: { 'application/json': [FILE_EXTENSION] } }]
const XMIND_TYPES = [{ description: 'XMind', accept: { 'application/octet-stream': ['.xmind'] } }]

const isAbort = (e: unknown) => e instanceof DOMException && e.name === 'AbortError'

// Each picker resolves to null when the user cancels the dialog.

export async function pickMapFile(): Promise<{ handle: FileSystemFileHandle; text: string } | null> {
  try {
    const [handle] = await window.showOpenFilePicker({ types: MAP_TYPES })
    const text = await (await handle.getFile()).text()
    return { handle, text }
  } catch (e) {
    if (isAbort(e)) return null
    throw e
  }
}

export async function pickXmindFile(): Promise<File | null> {
  try {
    const [handle] = await window.showOpenFilePicker({ types: XMIND_TYPES })
    return await handle.getFile()
  } catch (e) {
    if (isAbort(e)) return null
    throw e
  }
}

export async function pickSaveTarget(suggestedName: string): Promise<FileSystemFileHandle | null> {
  try {
    return await window.showSaveFilePicker({ suggestedName, types: MAP_TYPES })
  } catch (e) {
    if (isAbort(e)) return null
    throw e
  }
}

export async function writeFile(handle: FileSystemFileHandle, text: string) {
  const writable = await handle.createWritable()
  await writable.write(text)
  await writable.close()
}

export function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}
