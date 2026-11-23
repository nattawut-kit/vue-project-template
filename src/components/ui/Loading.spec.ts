import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Loading from '@/components/ui/Loading.vue'
import { isScrollLocked, resetScrollLock } from '@/utils/scrollLock'

afterEach(() => {
  resetScrollLock()
  document.body.innerHTML = ''
})

describe('Loading', () => {
  it('renders nothing when not shown', () => {
    mount(Loading, { props: { show: false } })
    expect(document.body.querySelector('[role="status"]')).toBeNull()
  })

  it('renders a spinner when shown', () => {
    mount(Loading, { props: { show: true } })

    expect(document.body.querySelector('[role="status"] .animate-spin')).not.toBeNull()
  })

  it('draws the spinner in the brand red with a 4px ring', () => {
    mount(Loading, { props: { show: true } })

    const spinner = document.body.querySelector<HTMLElement>(
      '[role="status"] [aria-hidden="true"] > span',
    )!
    expect(spinner.style.color).toBe('var(--app-brand)')
    const ring = document.body.querySelector<HTMLElement>('[role="status"] .animate-spin')!
    expect(ring.style.borderWidth).toBe('4px')
  })

  it('exposes a single status role for accessibility', () => {
    mount(Loading, { props: { show: true } })

    const statuses = document.body.querySelectorAll('[role="status"]')
    expect(statuses).toHaveLength(1)
    expect(statuses[0]?.getAttribute('aria-label')).toBe('กำลังโหลด')
    // The spinner is decorative, so it must not announce the loading state a second time.
    expect(document.body.querySelector('[aria-hidden="true"]')).not.toBeNull()
  })

  it('toggles visibility when show changes', async () => {
    const wrapper = mount(Loading, { props: { show: false } })
    expect(document.body.querySelector('[role="status"]')).toBeNull()

    await wrapper.setProps({ show: true })
    expect(document.body.querySelector('[role="status"]')).not.toBeNull()
  })

  it('locks page scroll while shown and releases it again', async () => {
    const wrapper = mount(Loading, { props: { show: false } })
    expect(isScrollLocked()).toBe(false)

    await wrapper.setProps({ show: true })
    expect(isScrollLocked()).toBe(true)

    await wrapper.setProps({ show: false })
    expect(isScrollLocked()).toBe(false)
  })

  it('releases the scroll lock if unmounted while still shown', () => {
    const wrapper = mount(Loading, { props: { show: true } })
    expect(isScrollLocked()).toBe(true)

    wrapper.unmount()
    expect(isScrollLocked()).toBe(false)
  })
})
