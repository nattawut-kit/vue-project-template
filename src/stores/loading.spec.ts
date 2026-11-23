import { describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useLoadingStore } from '@/stores/loading'

function createLoadingStore() {
  setActivePinia(createPinia())
  return useLoadingStore()
}

describe('useLoadingStore', () => {
  it('starts idle', () => {
    const loading = createLoadingStore()

    expect(loading.isLoading).toBe(false)
  })

  it('is loading while a loader is pending', () => {
    const loading = createLoadingStore()

    loading.show()
    expect(loading.isLoading).toBe(true)

    loading.hide()
    expect(loading.isLoading).toBe(false)
  })

  it('stays loading until every overlapping loader has finished', () => {
    const loading = createLoadingStore()

    loading.show()
    loading.show()
    loading.hide()
    // The first request finishing must not tear the overlay down under the second one.
    expect(loading.isLoading).toBe(true)

    loading.hide()
    expect(loading.isLoading).toBe(false)
  })

  it('ignores a hide with nothing pending, so the count cannot go negative', () => {
    const loading = createLoadingStore()

    loading.hide()
    expect(loading.pendingCount).toBe(0)

    // A later show() must still register instead of first paying off a negative balance.
    loading.show()
    expect(loading.isLoading).toBe(true)
  })
})
