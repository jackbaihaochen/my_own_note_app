import { FILE_EXTENSION } from '../mindmap/data'

// `description` labels the file type in the picker, in the current UI language
const mapTypes = (description: string) => [{ description, accept: { 'application/json': [FILE_EXTENSION] } }]
const XMIND_TYPES = [{ description: 'XMind', accept: { 'application/octet-stream': ['.xmind'] } }]

const isAbort = (e: unknown) => e instanceof DOMException && e.name === 'AbortError'

// Each picker resolves to null when the user cancels the dialog.

export async function pickMapFile(description: string): Promise<{ handle: FileSystemFileHandle; text: string; lastModified: number } | null> {
  try {
    const [handle] = await window.showOpenFilePicker({ types: mapTypes(description) })
    const file = await handle.getFile()
    return { handle, text: await file.text(), lastModified: file.lastModified }
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

export async function pickSaveTarget(suggestedName: string, description: string): Promise<FileSystemFileHandle | null> {
  try {
    return await window.showSaveFilePicker({ suggestedName, types: mapTypes(description) })
  } catch (e) {
    if (isAbort(e)) return null
    throw e
  }
}

// A handle restored from the browser draft starts without permission; asking needs a user
// gesture, which Cmd+S / the save button provides
export async function ensureWritePermission(handle: FileSystemFileHandle): Promise<boolean> {
  if ((await handle.queryPermission({ mode: 'readwrite' })) === 'granted') return true
  return (await handle.requestPermission({ mode: 'readwrite' })) === 'granted'
}

export async function fileLastModified(handle: FileSystemFileHandle): Promise<number> {
  return (await handle.getFile()).lastModified
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
