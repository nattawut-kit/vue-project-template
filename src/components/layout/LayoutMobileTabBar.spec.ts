import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { MOBILE_TABS } from '@/components/layout/mobileTabs'
import LayoutMobileTabBar from './LayoutMobileTabBar.vue'

const routeState: { meta: Record<string, unknown> } = { meta: {} }
const replace = vi.fn<(to: unknown) => Promise<void>>()

vi.mock('vue-router', () => ({
  useRoute: () => routeState,
  useRouter: () => ({ replace }),
}))

beforeEach(() => {
  routeState.meta = { current: 'home' }
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('LayoutMobileTabBar', () => {
  it('draws one button per tab with its label', () => {
    const wrapper = mount(LayoutMobileTabBar)

    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(MOBILE_TABS.length)
    expect(buttons.map((button) => button.text())).toEqual(MOBILE_TABS.map((tab) => tab.label))
  })

  it('marks the tab of meta.current as the current page', () => {
    const wrapper = mount(LayoutMobileTabBar)

    const current = wrapper.findAll('button[aria-current="page"]')
    expect(current).toHaveLength(1)
    expect(current[0]!.text()).toBe(MOBILE_TABS[0].label)
  })

  it('marks no tab on a page outside the tabs', () => {
    routeState.meta = {}

    const wrapper = mount(LayoutMobileTabBar)

    expect(wrapper.findAll('button[aria-current="page"]')).toHaveLength(0)
  })

  it('replaces the route when another tab is tapped', async () => {
    const wrapper = mount(LayoutMobileTabBar)

    await wrapper.findAll('button')[1]!.trigger('click')

    expect(replace).toHaveBeenCalledWith({ name: MOBILE_TABS[1].routeName })
  })

  it('does nothing when the current tab is tapped again', async () => {
    const wrapper = mount(LayoutMobileTabBar)

    await wrapper.findAll('button')[0]!.trigger('click')

    expect(replace).not.toHaveBeenCalled()
  })
})
