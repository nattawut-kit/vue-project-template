import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'
import { useDebouncedRef } from '@/composables/useDebouncedRef'

describe('useDebouncedRef', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('delays updates until the timeout elapses', async () => {
    const source = ref('a')
    const scope = effectScope()
    const debounced = scope.run(() => useDebouncedRef(source, 300))!

    source.value = 'ab'
    await nextTick()
    expect(debounced.value).toBe('a')

    vi.advanceTimersByTime(300)
    expect(debounced.value).toBe('ab')

    scope.stop()
  })

  it('keeps only the last value of a burst', async () => {
    const source = ref('a')
    const scope = effectScope()
    const debounced = scope.run(() => useDebouncedRef(source, 300))!

    source.value = 'ab'
    await nextTick()
    source.value = 'abc'
    await nextTick()

    vi.advanceTimersByTime(300)
    expect(debounced.value).toBe('abc')

    scope.stop()
  })
})
