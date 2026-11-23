import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import LayoutMobileTopBar from './LayoutMobileTopBar.vue'

const routeState: { meta: Record<string, unknown> } = { meta: {} }
const replace = vi.fn<(to: unknown) => Promise<void>>()

vi.mock('vue-router', () => ({
  useRoute: () => routeState,
  useRouter: () => ({ replace }),
}))

beforeEach(() => {
  routeState.meta = { backTo: { name: '/home' }, title: 'โปรไฟล์' }
})

enableAutoUnmount(afterEach)

afterEach(() => {
  vi.clearAllMocks()
})

describe('LayoutMobileTopBar', () => {
  it('shows the back button and the title on a page with a back route', () => {
    const wrapper = mount(LayoutMobileTopBar)

    expect(wrapper.find('button[aria-label="ย้อนกลับ"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('โปรไฟล์')
    expect(wrapper.text()).not.toContain('LOGO')
  })

  it('goes back to the back route with replace', async () => {
    const wrapper = mount(LayoutMobileTopBar)

    await wrapper.get('button[aria-label="ย้อนกลับ"]').trigger('click')

    expect(replace).toHaveBeenCalledWith({ name: '/home' })
  })

  it('disables the back button when the back route is empty', () => {
    routeState.meta = { backTo: '', title: 'หน้า' }

    const wrapper = mount(LayoutMobileTopBar)

    expect(wrapper.get('button[aria-label="ย้อนกลับ"]').attributes('disabled')).toBeDefined()
  })

  it('shows the logo and no title on a page with no back route', () => {
    routeState.meta = { title: 'หน้าแรก' }

    const wrapper = mount(LayoutMobileTopBar)

    expect(wrapper.text()).toContain('LOGO')
    expect(wrapper.text()).not.toContain('หน้าแรก')
    expect(wrapper.find('button[aria-label="ย้อนกลับ"]').exists()).toBe(false)
  })

  it('keeps the logo beside the title, with no back button, on a page with hideBack', () => {
    routeState.meta = { backTo: { name: '/home' }, title: 'ยืนยัน', hideBack: true }

    const wrapper = mount(LayoutMobileTopBar)

    expect(wrapper.text()).toContain('LOGO')
    expect(wrapper.text()).toContain('ยืนยัน')
    expect(wrapper.find('button[aria-label="ย้อนกลับ"]').exists()).toBe(false)
  })

  it('hides the logo on a page with hideLogo', () => {
    routeState.meta = { hideLogo: true }

    const wrapper = mount(LayoutMobileTopBar)

    expect(wrapper.text()).not.toContain('LOGO')
  })
})
