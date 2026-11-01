// The current map, kept in the browser so it survives closing the page (FILE-05).
// IndexedDB rather than localStorage: maps embed images, which outgrow localStorage's ~5MB,
// and only IndexedDB can store the file handle that lets Cmd+S write back to the same file.

export interface Draft {
  text: string // serialized map, same format as a .mindmap.json file
  name: string
  handle: FileSystemFileHandle | null
  fileModified: number | null // lastModified of the linked file when it was last opened / saved
  dirty: boolean // has changes not yet written to a file
}

// The deployed origin also serves unrelated pages, so the database gets a name of its own
const DB_NAME = 'my-own-xmind'
const STORE = 'draft'
const KEY = 'current'

// One connection for the page's lifetime instead of reopening on every autosave
let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  dbPromise ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => {
      dbPromise = null
      reject(req.error)
    }
  })
  return dbPromise
}

async function run<T>(mode: IDBTransactionMode, op: (store: IDBObjectStore) => IDBRequest): Promise<T> {
  const db = await openDb()
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode)
    const req = op(tx.objectStore(STORE))
    tx.oncomplete = () => resolve(req.result)
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

export async function loadDraft(): Promise<Draft | null> {
  return (await run<Draft | undefined>('readonly', store => store.get(KEY))) ?? null
}

export async function saveDraft(draft: Draft): Promise<void> {
  await run('readwrite', store => store.put(draft, KEY))
}
