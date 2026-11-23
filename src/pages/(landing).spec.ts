import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { PiniaColada } from '@pinia/colada'
import Page from './(landing).vue'

const replace = vi.fn<(to: unknown) => Promise<void>>().mockResolvedValue(undefined)
const loginWithLine = vi.fn<() => Promise<void>>().mockResolvedValue(undefined)

vi.mock('vue-router', () => ({
  useRouter: () => ({ replace }),
}))

vi.mock('@/composables/useLineLogin', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/composables/useLineLogin')>()),
  useLineLogin: () => ({ loginWithLine }),
}))

vi.mock('@line/liff', () => ({
  default: {
    init: vi.fn<(args: { liffId: string }) => Promise<void>>(),
    isLoggedIn: vi.fn<() => boolean>(() => false),
  },
}))

function mountPage() {
  return mount(Page, {
    global: {
      plugins: [createPinia(), PiniaColada],
      stubs: { Loading: true },
    },
  })
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.clearAllMocks()
})

describe('landing', () => {
  it('logs in with LINE when LIFF is on', async () => {
    vi.stubEnv('VITE_LIFF_ID', 'test-liff-id')

    mountPage()
    await flushPromises()

    expect(loginWithLine).toHaveBeenCalledOnce()
    expect(replace).not.toHaveBeenCalled()
  })

  it('goes straight to the home page when LIFF is off', async () => {
    vi.stubEnv('VITE_LIFF_ID', '')

    mountPage()
    await flushPromises()

    expect(loginWithLine).not.toHaveBeenCalled()
    expect(replace).toHaveBeenCalledWith({ name: '/home' })
  })

  it('goes to the page parked in ?redirect= when LIFF is off', async () => {
    vi.stubEnv('VITE_LIFF_ID', '')
    window.history.replaceState({}, '', '/?redirect=/profile')

    mountPage()
    await flushPromises()

    expect(replace).toHaveBeenCalledWith('/profile')
    window.history.replaceState({}, '', '/')
  })
})
