import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

// `import.meta.hot` is truthy under Vitest too, but isn't a real Vite HMR context, the router
// module's own `handleHotUpdate(router)` call would throw trying to use it. Only that helper is
// stubbed; the real generated `routes` still come through untouched.
vi.mock('vue-router/auto-routes', async (importOriginal) => ({
  ...(await importOriginal<typeof import('vue-router/auto-routes')>()),
  handleHotUpdate: vi.fn<() => void>(),
}))

const { router } = await import('@/router')

const Blank = defineComponent({ render: () => null })

// No page of the template needs a login, so the guard is tried on a page added for the test.
router.addRoute({
  path: '/members-only',
  name: 'members-only',
  component: Blank,
  meta: { requiresAuth: true },
})

beforeEach(async () => {
  setActivePinia(createPinia())
  // jsdom has no scrollTo, the router's scrollBehavior calls it after every navigation.
  vi.stubGlobal('scrollTo', () => {})
  // Each test starts from a neutral page: a replace to the route already shown never runs the guard.
  await router.replace({ name: '/home' })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  sessionStorage.clear()
  localStorage.clear()
})

describe('router guard', () => {
  it('lets a visitor with no token onto a page that needs no login', async () => {
    await router.replace({ name: '/profile' })

    expect(router.currentRoute.value.name).toBe('/profile')
  })

  it('sends a visitor with no token from a requiresAuth page to landing, keeping the way back', async () => {
    await router.replace('/members-only?tab=2')

    expect(router.currentRoute.value.name).toBe('/(landing)')
    expect(router.currentRoute.value.query.redirect).toBe('/members-only?tab=2')
  })

  it('lets a signed-in user onto a requiresAuth page', async () => {
    useAuthStore().setToken('a.b.c')

    await router.replace('/members-only')

    expect(router.currentRoute.value.name).toBe('members-only')
  })

  it('sends a link that matches no page to unauthorized', async () => {
    await router.replace('/no-such-page')

    expect(router.currentRoute.value.name).toBe('/unauthorized')
  })

  it('keeps the version page open to anyone', async () => {
    await router.replace({ name: '/version' })

    expect(router.currentRoute.value.name).toBe('/version')
  })

  it('opens the example pages in Vite mode development', async () => {
    vi.stubEnv('MODE', 'development')

    await router.replace({ name: '/examples/button' })

    expect(router.currentRoute.value.name).toBe('/examples/button')
  })

  it('closes the example pages in any other mode', async () => {
    vi.stubEnv('MODE', 'production')

    await router.replace({ name: '/examples/button' })

    expect(router.currentRoute.value.name).toBe('/unauthorized')
  })
})
