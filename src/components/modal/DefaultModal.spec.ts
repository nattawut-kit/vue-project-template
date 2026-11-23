import type { Plugin } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import VueDompurifyHTML from 'vue-dompurify-html'
import DefaultModal from '@/components/modal/DefaultModal.vue'
import { isScrollLocked, unlockScroll } from '@/utils/scrollLock'

const plugins: [Plugin, unknown][] = [
  [VueDompurifyHTML, { namedConfigurations: { svg: { USE_PROFILES: { svg: true } } } }],
]

beforeEach(() => {
  vi.stubGlobal('scrollTo', () => {})
})

afterEach(() => {
  while (isScrollLocked()) unlockScroll()
  document.body.style.cssText = ''
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

describe('DefaultModal', () => {
  it('renders the given title and content', async () => {
    mount(DefaultModal, {
      props: {
        type: 'success',
        title: 'Saved',
        content: 'Your changes were saved.',
        buttons: [{ action: 'submit', text: 'OK' }],
      },
      global: { plugins },
    })
    await nextTick()

    expect(document.body.textContent).toContain('Saved')
    expect(document.body.textContent).toContain('Your changes were saved.')
  })

  it('falls back to the default cancel copy when type is cancel with no title/content', async () => {
    mount(DefaultModal, {
      props: { type: 'error', buttons: [{ action: 'submit', text: 'OK' }] },
      global: { plugins },
    })
    await nextTick()

    expect(document.body.textContent).toContain('เกิดข้อผิดพลาด')
    expect(document.body.textContent).toContain('กรุณาลองใหม่อีกครั้ง')
  })

  it('emits ok when a submit button is clicked', async () => {
    const wrapper = mount(DefaultModal, {
      props: { buttons: [{ action: 'submit', text: 'Confirm' }] },
      global: { plugins },
    })
    await nextTick()

    document.querySelector('button')?.click()

    expect(wrapper.emitted('ok')).toHaveLength(1)
    expect(wrapper.emitted('cancel')).toBeUndefined()
  })

  it('emits cancel when a cancel button is clicked', async () => {
    const wrapper = mount(DefaultModal, {
      props: { buttons: [{ action: 'cancel', text: 'Dismiss' }] },
      global: { plugins },
    })
    await nextTick()

    document.querySelector('button')?.click()

    expect(wrapper.emitted('cancel')).toHaveLength(1)
    expect(wrapper.emitted('ok')).toBeUndefined()
  })

  it('shows a loading state on a button while its onClick is pending, then emits ok', async () => {
    let finish: () => void = () => {}
    const onClick = vi.fn<() => Promise<void>>(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve
        }),
    )
    const wrapper = mount(DefaultModal, {
      props: { buttons: [{ action: 'submit', text: 'Confirm', onClick }] },
      global: { plugins },
    })
    await nextTick()

    document.querySelector('button')?.click()
    await nextTick()

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(document.querySelector('button')?.getAttribute('aria-busy')).toBe('true')
    expect(wrapper.emitted('ok')).toBeUndefined()

    finish()
    await flushPromises()

    expect(wrapper.emitted('ok')).toHaveLength(1)
  })

  it('renders no button row when buttons is empty', async () => {
    mount(DefaultModal, {
      props: { title: 'No actions', buttons: [] },
      global: { plugins },
    })
    await nextTick()

    expect(document.querySelector('button')).toBeNull()
  })

  describe('error prop', () => {
    it("derives title/content from the error's locale['th-th'] when none are given", async () => {
      mount(DefaultModal, {
        props: {
          type: 'error',
          error: {
            http_status: 400,
            system: 'Bad Request',
            message: 'invalid input',
            locale: { 'th-th': { title: 'ข้อมูลไม่ถูกต้อง', message: 'กรุณาตรวจสอบข้อมูลอีกครั้ง' } },
          },
          buttons: [{ action: 'submit', text: 'OK' }],
        },
        global: { plugins },
      })
      await nextTick()

      expect(document.body.textContent).toContain('ข้อมูลไม่ถูกต้อง')
      expect(document.body.textContent).toContain('กรุณาตรวจสอบข้อมูลอีกครั้ง')
    })

    it('falls back to system/message when the error has no locale', async () => {
      mount(DefaultModal, {
        props: {
          type: 'error',
          error: { http_status: 500, system: 'Server Error', message: 'something broke' },
          buttons: [{ action: 'submit', text: 'OK' }],
        },
        global: { plugins },
      })
      await nextTick()

      expect(document.body.textContent).toContain('Server Error')
      expect(document.body.textContent).toContain('something broke')
    })

    it('prefers an explicit title/content over the error prop', async () => {
      mount(DefaultModal, {
        props: {
          type: 'error',
          title: 'Explicit title',
          content: 'Explicit content',
          error: {
            http_status: 400,
            system: 'Bad Request',
            message: 'invalid input',
            locale: { 'th-th': { title: 'ข้อมูลไม่ถูกต้อง', message: 'กรุณาตรวจสอบข้อมูลอีกครั้ง' } },
          },
          buttons: [{ action: 'submit', text: 'OK' }],
        },
        global: { plugins },
      })
      await nextTick()

      expect(document.body.textContent).toContain('Explicit title')
      expect(document.body.textContent).toContain('Explicit content')
      expect(document.body.textContent).not.toContain('ข้อมูลไม่ถูกต้อง')
    })

    it('falls back to the generic cancel copy for a non-api error', async () => {
      mount(DefaultModal, {
        props: {
          type: 'error',
          error: new Error('plain client-side failure'),
          buttons: [{ action: 'submit', text: 'OK' }],
        },
        global: { plugins },
      })
      await nextTick()

      expect(document.body.textContent).toContain('เกิดข้อผิดพลาด')
      expect(document.body.textContent).toContain('ระบบขัดข้อง กรุณาลองใหม่ภายหลัง')
    })
  })
})
