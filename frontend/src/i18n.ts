// UI text in each supported language (UI-01). `zh` is typed against `en`, so a missing entry
// is a type error; adding a language means adding one more dictionary.

export type Lang = 'en' | 'zh'

// Each language is named in itself, so the picker reads the same whatever language is active
export const LANGUAGES: { value: Lang; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' },
]

const en = {
  untitled: 'Untitled',
  unsaved: 'Unsaved',
  language: 'Language',
  newMap: 'New',
  open: 'Open',
  save: 'Save',
  saveAs: 'Save As',
  importXmind: 'Import XMind',
  insertImage: 'Insert Image',

  discardChanges: 'This map has unsaved changes. Discard them?',
  openFailed: (reason: string) => `Could not open the file: ${reason}`,
  importFailed: (reason: string) => `Could not import the file: ${reason}`,
  saveFailed: (reason: string) => `Could not save the file: ${reason}`,
  draftSaveFailed: (reason: string) => `Could not autosave to the browser: ${reason}`,
  fileChangedElsewhere: (name: string) =>
    `"${name}" was changed by another program after it was last opened or saved. Overwrite it with the current map?`,
  selectNodeFirst: 'Select a topic first.',
  invalidMapFile: 'Not a valid mind map file',
  linkPrompt: 'Link URL',

  bold: 'Bold ⌘B',
  italic: 'Italic ⌘I',
  underline: 'Underline ⌘U',
  strike: 'Strikethrough',
  fontSize: 'Font size',
  inlineCode: 'Inline code ⌘E',
  codeBlock: 'Code block',
  codeLanguage: 'Code language',
  plainCode: 'Plain text',
  link: 'Link',
  clearFormat: 'Clear formatting',

  minimap: 'Minimap',
  showMinimap: 'Show minimap',
  hideMinimap: 'Hide minimap',

  mindMapFileType: 'Mind map',
  rootTopic: 'Central Topic',
  mainTopic: 'Main Topic',
  subtopic: 'Subtopic',
}

export type Messages = typeof en

const zh: Messages = {
  untitled: '未命名',
  unsaved: '未保存',
  language: '界面语言',
  newMap: '新建',
  open: '打开',
  save: '保存',
  saveAs: '另存为',
  importXmind: '导入 XMind',
  insertImage: '插入图片',

  discardChanges: '当前导图有未保存的修改，确定放弃吗？',
  openFailed: reason => `打开失败：${reason}`,
  importFailed: reason => `导入失败：${reason}`,
  saveFailed: reason => `保存失败：${reason}`,
  draftSaveFailed: reason => `自动保存到浏览器失败：${reason}`,
  fileChangedElsewhere: name => `「${name}」在上次打开或保存之后被其他程序修改过，确定用当前内容覆盖吗？`,
  selectNodeFirst: '请先选中一个节点',
  invalidMapFile: '不是有效的导图文件',
  linkPrompt: '链接地址',

  bold: '粗体 ⌘B',
  italic: '斜体 ⌘I',
  underline: '下划线 ⌘U',
  strike: '删除线',
  fontSize: '字号',
  inlineCode: '行内代码 ⌘E',
  codeBlock: '代码块',
  codeLanguage: '代码语言',
  plainCode: '无高亮',
  link: '链接',
  clearFormat: '清除格式',

  minimap: '缩略图',
  showMinimap: '显示缩略图',
  hideMinimap: '收起缩略图',

  mindMapFileType: '思维导图',
  rootTopic: '中心主题',
  mainTopic: '分支主题',
  subtopic: '子主题',
}

export const messages: Record<Lang, Messages> = { en, zh }

// UI-02: Chinese for a Chinese browser, English for everything else
export function langFromBrowser(browserLang: string): Lang {
  return browserLang.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

const STORAGE_KEY = 'my-own-xmind:lang'

// A per-browser preference; storage can be unavailable (e.g. blocked site data), so fall back quietly
export function loadLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'zh') return saved
  } catch {
    // use the browser language below
  }
  return langFromBrowser(navigator.language)
}

export function saveLang(lang: Lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    // the choice just won't be remembered
  }
}
