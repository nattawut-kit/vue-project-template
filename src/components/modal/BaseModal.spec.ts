import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseModal from '@/components/modal/BaseModal.vue'
import { isScrollLocked, unlockScroll } from '@/utils/scrollLock'
import { clearDialogStackForTests } from '@/components/modal/dialog'

beforeEach(() => {
  // jsdom doesn't implement window.scrollTo — stub it so unlockScroll's restore-position call
  // doesn't log a "not implemented" warning for every test.
  vi.stubGlobal('scrollTo', () => {})
})

afterEach(() => {
  while (isScrollLocked()) unlockScroll()
  document.body.style.cssText = ''
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
  clearDialogStackForTests()
})

// BaseModal only reacts to modelValue *changing* to true (matching how it's meant to be used — start
// closed, then open, so the enter transition plays) — mounting already-open skips that transition
// and never wires up the Escape listener or scroll lock.
async function mountOpen(props: { closeOnBackdrop?: boolean; closeOnEsc?: boolean } = {}) {
  const wrapper = mount(BaseModal, { props: { modelValue: false, ...props } })
  await wrapper.setProps({ modelValue: true })
  return wrapper
}

describe('BaseModal', () => {
  it('renders the default slot only while open', async () => {
    const wrapper = mount(BaseModal, {
      props: { modelValue: false },
      slots: { default: '<p>Hello</p>' },
    })
    expect(document.body.textContent).not.toContain('Hello')

    await wrapper.setProps({ modelValue: true })

    expect(document.body.textContent).toContain('Hello')
  })

  it('closes on backdrop click by default', async () => {
    const wrapper = await mountOpen()

    document.querySelector<HTMLElement>('.fixed.inset-0')?.click()

    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })

  it('does not close on backdrop click when closeOnBackdrop is false', async () => {
    const wrapper = await mountOpen({ closeOnBackdrop: false })

    document.querySelector<HTMLElement>('.fixed.inset-0')?.click()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('closes on Escape by default', async () => {
    const wrapper = await mountOpen()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })

  it('does not close on Escape when closeOnEsc is false', async () => {
    const wrapper = await mountOpen({ closeOnEsc: false })

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('closes only the topmost modal when two are stacked and Escape is pressed once', async () => {
    const bottom = await mountOpen()
    const top = await mountOpen()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(top.emitted('update:modelValue')).toEqual([[false]])
    expect(bottom.emitted('update:modelValue')).toBeUndefined()
  })

  it('marks the panel as an aria-modal dialog', async () => {
    await mountOpen()

    const panel = document.querySelector('[role="dialog"]')
    expect(panel?.getAttribute('aria-modal')).toBe('true')
  })

  it('traps Tab so focus cycles from the last focusable element back to the first', async () => {
    const wrapper = mount(BaseModal, {
      props: { modelValue: false },
      slots: { default: '<button>First</button><button>Last</button>' },
    })
    await wrapper.setProps({ modelValue: true })

    const buttons = Array.from(document.querySelectorAll('button'))
    ;(buttons[buttons.length - 1] as HTMLElement).focus()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', cancelable: true }))

    expect(document.activeElement).toBe(buttons[0])
  })

  it('traps Shift+Tab so focus cycles from the first focusable element back to the last', async () => {
    const wrapper = mount(BaseModal, {
      props: { modelValue: false },
      slots: { default: '<button>First</button><button>Last</button>' },
    })
    await wrapper.setProps({ modelValue: true })

    const buttons = Array.from(document.querySelectorAll('button'))
    ;(buttons[0] as HTMLElement).focus()

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, cancelable: true }),
    )

    expect(document.activeElement).toBe(buttons[buttons.length - 1])
  })

  it('locks page scroll while open and releases it on close', async () => {
    const wrapper = mount(BaseModal, { props: { modelValue: false } })
    expect(isScrollLocked()).toBe(false)

    await wrapper.setProps({ modelValue: true })
    expect(isScrollLocked()).toBe(true)

    await wrapper.setProps({ modelValue: false })
    expect(isScrollLocked()).toBe(false)
  })

  it('releases the scroll lock on unmount while still open', async () => {
    const wrapper = await mountOpen()
    expect(isScrollLocked()).toBe(true)

    wrapper.unmount()

    expect(isScrollLocked()).toBe(false)
  })
})
