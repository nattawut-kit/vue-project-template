import { describe, expect, it } from 'vitest'
import { decodeHtmlText, decodeHtmlUrl } from './htmlText'

describe('decodeHtmlText', () => {
  it('turns &nbsp; into a single plain space', () => {
    expect(decodeHtmlText('โอวัลติน&nbsp; 3in1 สูตรซีโร่')).toBe('โอวัลติน 3in1 สูตรซีโร่')
  })

  it('leaves plain text alone', () => {
    expect(decodeHtmlText('วันละครั้ง')).toBe('วันละครั้ง')
  })

  it('gives an empty string for a null value', () => {
    expect(decodeHtmlText(null)).toBe('')
  })

  it('never turns text into markup', () => {
    expect(decodeHtmlText('a &lt;b&gt; c')).toBe('a <b> c')
  })
})

describe('decodeHtmlUrl', () => {
  it('decodes &amp; in a query string', () => {
    expect(decodeHtmlUrl('https://x.test/a.jpg?sv=1&amp;se=2')).toBe(
      'https://x.test/a.jpg?sv=1&se=2',
    )
  })

  it('returns null for an empty value', () => {
    expect(decodeHtmlUrl(null)).toBeNull()
    expect(decodeHtmlUrl('')).toBeNull()
  })
})
