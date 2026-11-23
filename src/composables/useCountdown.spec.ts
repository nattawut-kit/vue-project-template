import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'
import { formatCountdown, getRemainingSeconds, useCountdown } from '@/composables/useCountdown'

describe('formatCountdown', () => {
  it('pads minutes and seconds', () => {
    expect(formatCountdown(0)).toBe('00:00')
    expect(formatCountdown(65)).toBe('01:05')
  })

  it('stays mm:ss just under an hour', () => {
    expect(formatCountdown(59 * 60 + 59)).toBe('59:59')
  })

  it('switches to hh:mm:ss from one hour up', () => {
    expect(formatCountdown(3600)).toBe('01:00:00')
    expect(formatCountdown(75 * 60 + 5)).toBe('01:15:05')
  })
})

describe('getRemainingSeconds', () => {
  const now = Date.parse('2026-09-29T15:15:00+07:00')

  it('rounds a partial second up so the display never hits 00:00 early', () => {
    expect(getRemainingSeconds('2026-09-29T15:15:30.4+07:00', now)).toBe(31)
  })

  it('clamps an expiry in the past to 0', () => {
    expect(getRemainingSeconds('2026-09-29T15:00:00+07:00', now)).toBe(0)
  })

  it('is 0 for an unparseable date', () => {
    expect(getRemainingSeconds('not-a-date', now)).toBe(0)
  })
})

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-29T15:15:00+07:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('ticks down every second and flags expiry at zero', () => {
    const scope = effectScope()
    const { formatted, isExpired } = scope.run(() => useCountdown('2026-09-29T15:15:03+07:00'))!

    expect(formatted.value).toBe('00:03')
    expect(isExpired.value).toBe(false)

    vi.advanceTimersByTime(2000)
    expect(formatted.value).toBe('00:01')

    vi.advanceTimersByTime(1000)
    expect(formatted.value).toBe('00:00')
    expect(isExpired.value).toBe(true)

    scope.stop()
  })

  it('follows a reactive expiry', () => {
    const expiresAt = ref<string>('2026-09-29T15:16:00+07:00')
    const scope = effectScope()
    const { formatted } = scope.run(() => useCountdown(expiresAt))!

    expect(formatted.value).toBe('01:00')

    expiresAt.value = '2026-09-29T15:20:00+07:00'
    expect(formatted.value).toBe('05:00')

    scope.stop()
  })

  it('starts ticking again when a new expiry arrives after the old one ran out', async () => {
    const expiresAt = ref<string>('2026-09-29T15:15:02+07:00')
    const scope = effectScope()
    const { formatted, isExpired } = scope.run(() => useCountdown(expiresAt))!

    vi.advanceTimersByTime(3000)
    expect(isExpired.value).toBe(true)

    expiresAt.value = '2026-09-29T15:15:13+07:00'
    await nextTick()
    expect(formatted.value).toBe('00:10')

    vi.advanceTimersByTime(4000)
    expect(formatted.value).toBe('00:06')

    scope.stop()
  })

  it('does not start a timer for an expiry already in the past', () => {
    const scope = effectScope()
    scope.run(() => useCountdown('2026-09-29T15:00:00+07:00'))

    expect(vi.getTimerCount()).toBe(0)

    scope.stop()
  })

  it('stops ticking once the scope is disposed', () => {
    const scope = effectScope()
    scope.run(() => useCountdown('2026-09-29T15:16:00+07:00'))
    scope.stop()

    expect(vi.getTimerCount()).toBe(0)
  })
})
