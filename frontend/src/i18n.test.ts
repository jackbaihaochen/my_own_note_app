import { describe, expect, it } from 'vitest'
import { langFromBrowser, messages } from './i18n'

describe('i18n', () => {
  it('has the same entries in every language', () => {
    const keys = Object.keys(messages.en).sort()
    expect(Object.keys(messages.zh).sort()).toEqual(keys)
    for (const key of keys) {
      expect(typeof messages.zh[key as keyof typeof messages.zh]).toBe(typeof messages.en[key as keyof typeof messages.en])
    }
  })

  it('picks Chinese only for a Chinese browser', () => {
    expect(langFromBrowser('zh-CN')).toBe('zh')
    expect(langFromBrowser('zh-TW')).toBe('zh')
    expect(langFromBrowser('ZH')).toBe('zh')
    expect(langFromBrowser('en-US')).toBe('en')
    expect(langFromBrowser('ja')).toBe('en')
  })
})
