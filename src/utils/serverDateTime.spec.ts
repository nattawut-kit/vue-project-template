import { describe, expect, it } from 'vitest'
import { parseServerDateTime } from '@/utils/serverDateTime'

describe('parseServerDateTime', () => {
  it('reads a date time with no offset as the server clock (+07:00)', () => {
    expect(parseServerDateTime('2026-05-11T10:43:12.345').getTime()).toBe(
      new Date('2026-05-11T10:43:12.345+07:00').getTime(),
    )
  })

  it('reads the space separated form too', () => {
    expect(parseServerDateTime('2026-10-04 10:16:30').getTime()).toBe(
      new Date('2026-10-04T10:16:30+07:00').getTime(),
    )
  })

  it('keeps an offset or a Z the value already has', () => {
    expect(parseServerDateTime('2026-05-11T10:43:00+09:00').getTime()).toBe(
      new Date('2026-05-11T10:43:00+09:00').getTime(),
    )
    expect(parseServerDateTime('2026-05-11T03:43:00Z').getTime()).toBe(
      new Date('2026-05-11T03:43:00Z').getTime(),
    )
  })
})
