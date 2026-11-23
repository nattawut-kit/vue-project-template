import { describe, expect, it } from 'vitest'
import { toSafeHttpUrl } from '@/utils/safeUrl'

describe('toSafeHttpUrl', () => {
  it('keeps http and https urls', () => {
    expect(toSafeHttpUrl('https://track.thailandpost.co.th/?trackNumber=EF1')).toBe(
      'https://track.thailandpost.co.th/?trackNumber=EF1',
    )
    expect(toSafeHttpUrl('http://example.com/a')).toBe('http://example.com/a')
  })

  it('trims surrounding whitespace', () => {
    expect(toSafeHttpUrl('  https://example.com/  ')).toBe('https://example.com/')
  })

  it('rejects other schemes', () => {
    expect(toSafeHttpUrl('javascript:alert(1)')).toBeNull()
    expect(toSafeHttpUrl('data:text/html,<script>alert(1)</script>')).toBeNull()
  })

  it('is null for empty, missing or unparseable values', () => {
    expect(toSafeHttpUrl('')).toBeNull()
    expect(toSafeHttpUrl(null)).toBeNull()
    expect(toSafeHttpUrl(undefined)).toBeNull()
    expect(toSafeHttpUrl('not a url')).toBeNull()
  })
})
