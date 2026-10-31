import { describe, expect, it } from 'vitest'
import { highlightCodeBlocks } from './highlight'

const block = (language: string) =>
  `<div class="smm-richtext-node-wrap"><div class="ql-code-block-container">` +
  `<div class="ql-code-block" data-language="${language}">spec:</div>` +
  `<div class="ql-code-block" data-language="${language}">&nbsp;&nbsp;replicas: 3</div>` +
  `</div></div>`

describe('code block highlighting (TXT-04)', () => {
  it('colours blocks with a known language and keeps the text and line breaks', () => {
    document.body.innerHTML = block('yaml')
    highlightCodeBlocks(document.body)
    const container = document.querySelector('.ql-code-block-container')!
    expect(container.querySelector('.hljs-attr')).not.toBeNull()
    expect(container.textContent).toBe('spec:\n  replicas: 3')
  })

  it('leaves plain blocks untouched', () => {
    document.body.innerHTML = block('plain')
    const before = document.body.innerHTML
    highlightCodeBlocks(document.body)
    expect(document.body.innerHTML).toBe(before)
  })
})
