import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import {
  activeDialogs,
  clearDialogStackForTests,
  closeAllDialogs,
  Dialog,
  isTopDialog,
  popDialog,
  pushDialog,
} from '@/components/modal/dialog'

const StubDialog = defineComponent({
  name: 'StubDialog',
  render: () => h('div'),
})

afterEach(() => {
  closeAllDialogs()
  vi.useRealTimers()
})

describe('Dialog.create', () => {
  it('pushes a new instance onto activeDialogs', () => {
    Dialog.create({ component: StubDialog, componentProps: { title: 'Hi' } })

    expect(activeDialogs.value).toHaveLength(1)
    expect(activeDialogs.value[0]!.componentProps).toEqual({ title: 'Hi' })
  })

  it('calls onOk when closed with an ok result, and not onCancel', () => {
    vi.useFakeTimers()
    const onOk = vi.fn<(payload?: unknown) => void>()
    const onCancel = vi.fn<(payload?: unknown) => void>()

    const handle = Dialog.create({ component: StubDialog })
    handle.onOk(onOk).onCancel(onCancel)

    activeDialogs.value[0]!.close('ok', { code: 42 })

    expect(onOk).toHaveBeenCalledWith({ code: 42 })
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('calls onCancel when closed with a cancel result, and not onOk', () => {
    vi.useFakeTimers()
    const onOk = vi.fn<(payload?: unknown) => void>()
    const onCancel = vi.fn<(payload?: unknown) => void>()

    const handle = Dialog.create({ component: StubDialog })
    handle.onOk(onOk).onCancel(onCancel)

    activeDialogs.value[0]!.close('cancel', { reason: 'expired' })

    expect(onCancel).toHaveBeenCalledWith({ reason: 'expired' })
    expect(onOk).not.toHaveBeenCalled()
  })

  it('calls onDismiss for both ok and cancel results', () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn<(result: string, payload?: unknown) => void>()

    Dialog.create({ component: StubDialog }).onDismiss(onDismiss)
    activeDialogs.value[0]!.close('ok', 1)

    expect(onDismiss).toHaveBeenCalledWith('ok', 1)
  })

  it('removes the instance from activeDialogs after the leave transition', () => {
    vi.useFakeTimers()
    Dialog.create({ component: StubDialog })
    expect(activeDialogs.value).toHaveLength(1)

    activeDialogs.value[0]!.close('ok')
    expect(activeDialogs.value).toHaveLength(1)

    vi.advanceTimersByTime(300)
    expect(activeDialogs.value).toHaveLength(0)
  })

  it('supports multiple dialogs open at once', () => {
    Dialog.create({ component: StubDialog })
    Dialog.create({ component: StubDialog })

    expect(activeDialogs.value).toHaveLength(2)
  })
})

describe('closeAllDialogs', () => {
  it('clears every open dialog without firing its callbacks', () => {
    const onCancel = vi.fn<(payload?: unknown) => void>()
    Dialog.create({ component: StubDialog }).onCancel(onCancel)

    closeAllDialogs()

    expect(activeDialogs.value).toHaveLength(0)
    expect(onCancel).not.toHaveBeenCalled()
  })
})

describe('dialog stack (pushDialog/popDialog/isTopDialog)', () => {
  afterEach(() => {
    clearDialogStackForTests()
  })

  it('treats the only open dialog as top', () => {
    const id = Symbol('a')
    pushDialog(id)

    expect(isTopDialog(id)).toBe(true)
  })

  it('treats the most recently opened dialog as top', () => {
    const first = Symbol('a')
    const second = Symbol('b')
    pushDialog(first)
    pushDialog(second)

    expect(isTopDialog(first)).toBe(false)
    expect(isTopDialog(second)).toBe(true)
  })

  it('restores the previous dialog as top once the topmost one is popped', () => {
    const first = Symbol('a')
    const second = Symbol('b')
    pushDialog(first)
    pushDialog(second)

    popDialog(second)

    expect(isTopDialog(first)).toBe(true)
  })

  it('is a no-op popping an id that was never pushed', () => {
    const id = Symbol('a')

    expect(() => popDialog(id)).not.toThrow()
    expect(isTopDialog(id)).toBe(false)
  })
})
