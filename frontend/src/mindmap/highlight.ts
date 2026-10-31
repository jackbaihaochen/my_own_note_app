import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import go from 'highlight.js/lib/languages/go'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import python from 'highlight.js/lib/languages/python'
import typescript from 'highlight.js/lib/languages/typescript'
import yaml from 'highlight.js/lib/languages/yaml'

const languages = { yaml, bash, json, python, javascript, typescript, go }
for (const [name, lang] of Object.entries(languages)) hljs.registerLanguage(name, lang)

export const CODE_LANGUAGES = Object.keys(languages)

// Options for Quill's syntax module, which highlights code blocks while they are being edited
export const QUILL_SYNTAX_OPTIONS = {
  hljs,
  interval: 150,
  languages: [{ key: 'plain', label: 'Plain' }, ...CODE_LANGUAGES.map(key => ({ key, label: key }))],
}

// Stored data keeps plain Quill code blocks; colouring is applied to the rendered DOM only.
// The coloured text is identical to the measured text, so node sizes stay correct.
export function highlightCodeBlocks(root: ParentNode) {
  root.querySelectorAll<HTMLElement>('.smm-richtext-node-wrap .ql-code-block-container').forEach(container => {
    if (container.dataset.highlighted) return
    const lines = Array.from(container.querySelectorAll<HTMLElement>('.ql-code-block'))
    const language = lines[0]?.dataset.language
    if (!language || !hljs.getLanguage(language)) return
    const code = lines.map(line => (line.textContent ?? '').replace(/ /g, ' ')).join('\n')
    const { value } = hljs.highlight(code, { language })
    container.dataset.highlighted = '1'
    container.innerHTML = `<code class="hljs">${value}</code>`
  })
}
