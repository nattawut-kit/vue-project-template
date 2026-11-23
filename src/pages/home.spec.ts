import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Page from './home.vue'

const replace = vi.fn<(to: unknown) => Promise<void>>()

vi.mock('vue-router', () => ({
  useRouter: () => ({ replace }),
}))

afterEach(() => {
  vi.unstubAllEnvs()
  replace.mockReset()
})

describe('home', () => {
  it('opens the guide page from its button', async () => {
    const wrapper = mount(Page)

    await wrapper.get('[data-test="guide-button"]').trigger('click')

    expect(replace).toHaveBeenCalledWith({ name: '/guide' })
  })

  it('opens the example pages in Vite mode development', async () => {
    vi.stubEnv('MODE', 'development')
    const wrapper = mount(Page)

    await wrapper.get('[data-test="examples-button"]').trigger('click')

    expect(replace).toHaveBeenCalledWith({ name: '/examples/' })
  })

  it('hides the examples button in any other mode, those pages are closed there', () => {
    vi.stubEnv('MODE', 'production')

    expect(mount(Page).find('[data-test="examples-button"]').exists()).toBe(false)
  })
})
