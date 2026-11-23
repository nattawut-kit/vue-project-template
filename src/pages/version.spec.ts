import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Page from './version.vue'

const replace = vi.fn<(to: unknown) => Promise<void>>()

vi.mock('vue-router', () => ({
  useRouter: () => ({ replace }),
}))

function values(): string[] {
  return mount(Page)
    .findAll('[data-test="version-value"]')
    .map((node) => node.text())
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  replace.mockReset()
})

describe('version', () => {
  it('shows the app version and the build environment', () => {
    vi.stubEnv('VITE_APP_VERSION', '1.2.3')
    vi.stubEnv('VITE_BUILD_MODE', 'staging')

    expect(values().slice(0, 2)).toEqual(['1.2.3', 'staging'])
  })

  it('shows a dash when the build has no version', () => {
    vi.stubEnv('VITE_APP_VERSION', '')

    expect(values()[0]).toBe('-')
  })

  it('falls back to the Vite mode when the build mode is not set', () => {
    vi.stubEnv('VITE_BUILD_MODE', '')

    expect(values()[1]).toBe('test')
  })

  it('shows when the app was built as day/month/year (พ.ศ.) and time', () => {
    expect(values()[2]).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/)
  })

  it('goes back to the home page from the button', async () => {
    const wrapper = mount(Page)

    await wrapper.find('[data-test="home-button"]').trigger('click')

    expect(replace).toHaveBeenCalledWith({ name: '/home' })
  })

  it('reloads the page from the button', async () => {
    const reload = vi.fn<() => void>()
    vi.stubGlobal('location', { ...window.location, reload })
    const wrapper = mount(Page)

    await wrapper.find('[data-test="reload-button"]').trigger('click')

    expect(reload).toHaveBeenCalledOnce()
  })
})
