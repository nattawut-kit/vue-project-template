import { describe, expect, it } from 'vitest'
import { escapeHtml } from '@/utils/escapeHtml'

describe('escapeHtml', () => {
  it('escapes the five characters that mean something in HTML', () => {
    expect(escapeHtml(`<a href="x" title='y'>&</a>`)).toBe(
      '&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;',
    )
  })

  it('escapes an ampersand first, so a finished entity is not escaped a second time', () => {
    expect(escapeHtml('A&amp;B')).toBe('A&amp;amp;B')
  })

  it('leaves a plain Thai text and its digits alone', () => {
    expect(escapeHtml('คูปองส่วนลด 50 บาท [E-Code]')).toBe('คูปองส่วนลด 50 บาท [E-Code]')
  })

  it('returns an empty text as it is', () => {
    expect(escapeHtml('')).toBe('')
  })
})
