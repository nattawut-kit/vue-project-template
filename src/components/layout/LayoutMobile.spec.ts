import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { reactive } from 'vue'
import LayoutMobile from './LayoutMobile.vue'

interface RouteState {
  matched: unknown[]
  meta: { hideTopBar?: boolean; hideTabBar?: boolean; overlapTopBar?: number }
}

const routeState = reactive<RouteState>({ matched: [{}], meta: {} })

vi.mock('vue-router', () => ({
  useRoute: () => routeState,
}))

vi.mock('@/components/layout/LayoutMobileTopBar.vue', async () => {
  const { defineComponent, h } = await import('vue')
  return { default: defineComponent({ render: () => h('header', { 'data-test': 'top-bar' }) }) }
})

vi.mock('@/components/layout/LayoutMobileTabBar.vue', async () => {
  const { defineComponent, h } = await import('vue')
  return { default: defineComponent({ render: () => h('nav', { 'data-test': 'tab-bar' }) }) }
})

beforeEach(() => {
  routeState.matched = [{}]
  routeState.meta = {}
})

function mountLayout() {
  return mount(LayoutMobile, { slots: { default: '<p>page</p>' } })
}

function mainMargin(wrapper: ReturnType<typeof mountLayout>): string {
  return (wrapper.get('main').element as HTMLElement).style.marginTop
}

describe('LayoutMobile', () => {
  it('shows the page between the bars', () => {
    const wrapper = mountLayout()

    expect(wrapper.find('[data-test="top-bar"]').exists()).toBe(true)
    expect(wrapper.get('main').text()).toBe('page')
    expect(wrapper.find('[data-test="tab-bar"]').exists()).toBe(true)
  })

  it('hides the bars a page turns off', () => {
    routeState.meta = { hideTopBar: true, hideTabBar: true }

    const wrapper = mountLayout()

    expect(wrapper.find('[data-test="top-bar"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="tab-bar"]').exists()).toBe(false)
  })

  it('hides both bars until the router has resolved its first navigation', () => {
    routeState.matched = []

    const wrapper = mountLayout()

    expect(wrapper.find('[data-test="top-bar"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="tab-bar"]').exists()).toBe(false)
  })

  describe('the page pulled up under the top bar', () => {
    it('does not pull a page up by default', () => {
      expect(mainMargin(mountLayout())).toBe('')
    })

    it('pulls a page up by its own overlapTopBar', () => {
      routeState.meta = { overlapTopBar: 16 }

      expect(mainMargin(mountLayout())).toBe('-16px')
    })

    it('does not pull a page up when overlapTopBar is 0', () => {
      routeState.meta = { overlapTopBar: 0 }

      expect(mainMargin(mountLayout())).toBe('')
    })

    it('does not pull a page up when it has no top bar to sit under', () => {
      routeState.meta = { hideTopBar: true }

      expect(mainMargin(mountLayout())).toBe('')
    })

    it('does not pull a page up with its own overlapTopBar either when it has no top bar', () => {
      routeState.meta = { hideTopBar: true, overlapTopBar: 16 }

      expect(mainMargin(mountLayout())).toBe('')
    })

    it('does not pull anything up before the router has resolved', () => {
      routeState.matched = []

      expect(mainMargin(mountLayout())).toBe('')
    })
  })
})
