import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import DefaultModal from '@/components/modal/DefaultModal.vue'
import { activeDialogs, closeAllDialogs } from '@/components/modal/dialog'
import { clearSessionAndRestart, showErrorDialog } from '@/components/modal/errorDialog'

const reload = vi.fn<() => void>()

beforeEach(() => {
  vi.stubGlobal('location', { ...window.location, reload })
})

afterEach(() => {
  vi.unstubAllGlobals()
  closeAllDialogs()
  vi.clearAllMocks()
  localStorage.clear()
  sessionStorage.clear()
})

describe('showErrorDialog', () => {
  it('opens an error-type DefaultModal with the given title/content', () => {
    showErrorDialog({ title: 'ผิดพลาด', content: 'ลองใหม่อีกครั้ง' })

    expect(activeDialogs.value).toHaveLength(1)
    expect(activeDialogs.value[0]!.component).toBe(DefaultModal)
    expect(activeDialogs.value[0]!.componentProps).toMatchObject({
      type: 'error',
      title: 'ผิดพลาด',
      content: 'ลองใหม่อีกครั้ง',
    })
  })

  it('passes an error through so DefaultModal can derive its own copy', () => {
    const error = { http_status: 400 }

    showErrorDialog({ error })

    expect(activeDialogs.value[0]!.componentProps).toMatchObject({ error })
  })

  it('defaults to a single close button when none are given', () => {
    showErrorDialog()

    expect(activeDialogs.value[0]!.componentProps.buttons).toEqual([
      { action: 'submit', text: 'ปิด' },
    ])
  })

  it('uses the caller-supplied buttons over the default', () => {
    const buttons = [{ action: 'submit' as const, text: 'ลองใหม่อีกครั้งภายหลัง' }]

    showErrorDialog({ buttons })

    expect(activeDialogs.value[0]!.componentProps.buttons).toEqual(buttons)
  })

  it('returns a handle whose onOk fires when the dialog closes with ok', () => {
    let confirmed = false

    showErrorDialog().onOk(() => {
      confirmed = true
    })

    activeDialogs.value[0]!.close('ok')

    expect(confirmed).toBe(true)
  })

  it('clears local/session storage and reloads on a 401 error', () => {
    localStorage.setItem('some_key', 'value')
    sessionStorage.setItem('app_token', 'stale-token')

    showErrorDialog({ error: { http_status: 401 } })
    activeDialogs.value[0]!.close('ok')

    expect(localStorage.getItem('some_key')).toBeNull()
    expect(sessionStorage.getItem('app_token')).toBeNull()
    expect(reload).toHaveBeenCalledOnce()
  })

  it('does not clear storage on dismiss for a non-401 error', () => {
    sessionStorage.setItem('app_token', 'still-valid')

    showErrorDialog({ error: { http_status: 400 } })
    activeDialogs.value[0]!.close('ok')

    expect(sessionStorage.getItem('app_token')).toBe('still-valid')
    expect(reload).not.toHaveBeenCalled()
  })

  it('calls onSubmit when the dialog closes with ok', () => {
    const onSubmit = vi.fn<() => void>()

    showErrorDialog({ onSubmit })
    activeDialogs.value[0]!.close('ok')

    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('calls onCancel when the dialog closes with cancel, and not onSubmit', () => {
    const onSubmit = vi.fn<() => void>()
    const onCancel = vi.fn<() => void>()

    showErrorDialog({ onSubmit, onCancel })
    activeDialogs.value[0]!.close('cancel')

    expect(onCancel).toHaveBeenCalledOnce()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('runs both the 401 cleanup and a caller-supplied onSubmit', () => {
    const onSubmit = vi.fn<() => void>()

    showErrorDialog({ error: { http_status: 401 }, onSubmit })
    activeDialogs.value[0]!.close('ok')

    expect(onSubmit).toHaveBeenCalledOnce()
    expect(reload).toHaveBeenCalledOnce()
  })
})

describe('clearSessionAndRestart', () => {
  it('clears local and session storage', () => {
    localStorage.setItem('some_key', 'value')
    sessionStorage.setItem('app_token', 'stale-token')

    clearSessionAndRestart()

    expect(localStorage.getItem('some_key')).toBeNull()
    expect(sessionStorage.getItem('app_token')).toBeNull()
  })

  it('reloads the page', () => {
    clearSessionAndRestart()

    expect(reload).toHaveBeenCalledOnce()
  })
})
