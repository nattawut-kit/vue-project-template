import { afterEach, describe, expect, it, vi } from 'vitest'
import { createPinia } from 'pinia'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import liff from '@line/liff'
import { isLiffEnabled, useLiffStore } from '@/stores/liff'

vi.mock('@line/liff', () => ({
  default: {
    init: vi.fn<(args: { liffId: string }) => Promise<void>>(),
    isLoggedIn: vi.fn<() => boolean>(() => false),
  },
}))

function mountLiffStore() {
  const pinia = createPinia()
  const HostComponent = defineComponent({
    setup() {
      return useLiffStore()
    },
    template: '<i />',
  })

  const wrapper = mount(HostComponent, { global: { plugins: [pinia] } })
  return wrapper.vm
}

describe('useLiffStore', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.clearAllMocks()
  })

  it('starts not ready with no error', () => {
    const store = mountLiffStore()

    expect(store.isReady).toBe(false)
    expect(store.isLoggedIn).toBe(false)
    expect(store.error).toBeNull()
  })

  it('does nothing when VITE_LIFF_ID is empty, LIFF is off', async () => {
    vi.stubEnv('VITE_LIFF_ID', '')
    const store = mountLiffStore()

    await store.init()

    expect(store.error).toBeNull()
    expect(store.isReady).toBe(false)
    expect(liff.init).not.toHaveBeenCalled()
  })

  it('reports whether LIFF is enabled from VITE_LIFF_ID', () => {
    vi.stubEnv('VITE_LIFF_ID', '')
    expect(isLiffEnabled()).toBe(false)

    vi.stubEnv('VITE_LIFF_ID', 'test-liff-id')
    expect(isLiffEnabled()).toBe(true)
  })

  it('becomes ready after a successful init', async () => {
    vi.stubEnv('VITE_LIFF_ID', 'test-liff-id')
    vi.mocked(liff.init).mockResolvedValue(undefined)
    vi.mocked(liff.isLoggedIn).mockReturnValue(false)
    const store = mountLiffStore()

    await store.init()

    expect(liff.init).toHaveBeenCalledWith({ liffId: 'test-liff-id' })
    expect(store.isReady).toBe(true)
    expect(store.isLoggedIn).toBe(false)
  })

  it('reflects isLoggedIn from the SDK once ready', async () => {
    vi.stubEnv('VITE_LIFF_ID', 'test-liff-id')
    vi.mocked(liff.init).mockResolvedValue(undefined)
    vi.mocked(liff.isLoggedIn).mockReturnValue(true)
    const store = mountLiffStore()

    await store.init()

    expect(store.isReady).toBe(true)
    expect(store.isLoggedIn).toBe(true)
  })

  it('sets an error when liff.init rejects', async () => {
    vi.stubEnv('VITE_LIFF_ID', 'test-liff-id')
    vi.mocked(liff.init).mockRejectedValue(new Error('network down'))
    const store = mountLiffStore()

    await store.init()

    expect(store.error).toBe('network down')
    expect(store.isReady).toBe(false)
  })

  it('does not call liff.init again once already ready', async () => {
    vi.stubEnv('VITE_LIFF_ID', 'test-liff-id')
    vi.mocked(liff.init).mockResolvedValue(undefined)
    vi.mocked(liff.isLoggedIn).mockReturnValue(false)
    const store = mountLiffStore()

    await store.init()
    await store.init()

    expect(liff.init).toHaveBeenCalledTimes(1)
  })

  it('does not retry once a previous init already failed', async () => {
    vi.stubEnv('VITE_LIFF_ID', 'test-liff-id')
    vi.mocked(liff.init).mockRejectedValue(new Error('network down'))
    const store = mountLiffStore()

    await store.init()
    await store.init()

    expect(liff.init).toHaveBeenCalledTimes(1)
  })
})
