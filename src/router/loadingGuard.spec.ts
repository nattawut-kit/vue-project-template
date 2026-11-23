import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter, type RouteRecordRaw } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent } from 'vue'
import {
  installLoadingGuard,
  manageNextNavigationLoading,
  SHOW_DELAY_MS,
} from '@/router/loadingGuard'
import { useLoadingStore } from '@/stores/loading'

const Blank = defineComponent({ template: '<i />' })

function createTestRouter(routes: RouteRecordRaw[]) {
  const router = createRouter({ history: createMemoryHistory(), routes })
  installLoadingGuard(router)
  return router
}

/** A route whose component only resolves once the returned `finish()` is called. */
function createSlowRoute(path: string) {
  let finish!: () => void
  const route: RouteRecordRaw = {
    path,
    component: () =>
      new Promise((resolve) => {
        finish = () => resolve(Blank)
      }),
  }
  return { route, finish: () => finish() }
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('installLoadingGuard', () => {
  it('never shows the overlay for a navigation that resolves quickly', async () => {
    const router = createTestRouter([
      { path: '/', component: Blank },
      { path: '/fast', component: Blank },
    ])
    await router.push('/')
    const loading = useLoadingStore()

    await router.push('/fast')
    expect(loading.isLoading).toBe(false)

    // Well past the delay: the timer must have been cleared, not merely not fired yet.
    await vi.advanceTimersByTimeAsync(1000)
    expect(loading.isLoading).toBe(false)
  })

  it('shows the overlay once a navigation outlasts the delay, then hides it on arrival', async () => {
    const slow = createSlowRoute('/slow')
    const router = createTestRouter([{ path: '/', component: Blank }, slow.route])
    await router.push('/')
    const loading = useLoadingStore()

    const navigation = router.push('/slow')
    await vi.advanceTimersByTimeAsync(SHOW_DELAY_MS - 1)
    expect(loading.isLoading).toBe(false)

    await vi.advanceTimersByTimeAsync(1)
    expect(loading.isLoading).toBe(true)

    slow.finish()
    await navigation
    expect(loading.isLoading).toBe(false)
  })

  it('hides the overlay when a navigation is aborted by a guard', async () => {
    const slow = createSlowRoute('/slow')
    const router = createTestRouter([{ path: '/', component: Blank }, slow.route])
    await router.push('/')
    const loading = useLoadingStore()

    router.beforeEach((to) => (to.path === '/blocked' ? false : undefined))
    const navigation = router.push('/slow')
    await vi.advanceTimersByTimeAsync(SHOW_DELAY_MS + 50)
    expect(loading.isLoading).toBe(true)

    slow.finish()
    await navigation

    // An aborted navigation still reaches afterEach, so the overlay must not be left stranded.
    await router.push('/blocked').catch(() => undefined)
    await vi.advanceTimersByTimeAsync(1000)
    expect(loading.isLoading).toBe(false)
  })

  it('does not stack shows when a guard redirects mid-navigation', async () => {
    const slow = createSlowRoute('/slow')
    const router = createTestRouter([
      { path: '/', component: Blank },
      { path: '/from', component: Blank },
      slow.route,
    ])
    await router.push('/')
    const loading = useLoadingStore()

    router.beforeEach((to) => (to.path === '/from' ? '/slow' : undefined))

    const navigation = router.push('/from')
    await vi.advanceTimersByTimeAsync(SHOW_DELAY_MS + 50)
    expect(loading.isLoading).toBe(true)

    slow.finish()
    await navigation
    // Two beforeEach runs (original + redirect target) must still net out to a hidden overlay.
    expect(loading.isLoading).toBe(false)
  })

  it('never shows the overlay navigating into a self-managed route', async () => {
    const slowLanding = createSlowRoute('/landing')
    slowLanding.route.name = '/(landing)'
    const router = createTestRouter([{ path: '/', component: Blank }, slowLanding.route])
    await router.push('/')
    const loading = useLoadingStore()

    const navigation = router.push('/landing')
    await vi.advanceTimersByTimeAsync(SHOW_DELAY_MS + 50)
    expect(loading.isLoading).toBe(false)

    slowLanding.finish()
    await navigation
    expect(loading.isLoading).toBe(false)
  })

  it('never shows the overlay navigating out of a self-managed route', async () => {
    const slow = createSlowRoute('/slow')
    const router = createTestRouter([
      { path: '/', component: Blank },
      { path: '/landing', name: '/(landing)', component: Blank },
      slow.route,
    ])
    await router.push('/landing')
    const loading = useLoadingStore()

    const navigation = router.push('/slow')
    await vi.advanceTimersByTimeAsync(SHOW_DELAY_MS + 50)
    expect(loading.isLoading).toBe(false)

    slow.finish()
    await navigation
    expect(loading.isLoading).toBe(false)
  })

  describe('manageNextNavigationLoading', () => {
    it('keeps the overlay out of the next navigation only', async () => {
      const first = createSlowRoute('/first')
      const second = createSlowRoute('/second')
      const router = createTestRouter([{ path: '/', component: Blank }, first.route, second.route])
      await router.push('/')
      const loading = useLoadingStore()

      manageNextNavigationLoading()
      const navigation = router.push('/first')
      await vi.advanceTimersByTimeAsync(SHOW_DELAY_MS + 50)
      expect(loading.isLoading).toBe(false)
      first.finish()
      await navigation

      const next = router.push('/second')
      await vi.advanceTimersByTimeAsync(SHOW_DELAY_MS + 50)
      expect(loading.isLoading).toBe(true)
      second.finish()
      await next
      expect(loading.isLoading).toBe(false)
    })

    it('does not carry over to the next navigation when its own one never ran', async () => {
      const slow = createSlowRoute('/slow')
      const router = createTestRouter([{ path: '/', component: Blank }, slow.route])
      await router.push('/')
      const loading = useLoadingStore()

      manageNextNavigationLoading()
      await router.push('/')

      const navigation = router.push('/slow')
      await vi.advanceTimersByTimeAsync(SHOW_DELAY_MS + 50)
      expect(loading.isLoading).toBe(true)
      slow.finish()
      await navigation
    })
  })
})
