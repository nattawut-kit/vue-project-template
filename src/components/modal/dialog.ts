/**
 * Dialog engine — open a modal from anywhere, without placing a component on every page.
 *
 * Dialog.create() just pushes a component onto a stack; <DialogHost /> (mounted once in App.vue)
 * renders it. The component passed in talks back via 'ok'/'cancel' emits through
 * useDialogComponent().
 *
 * Dialog.create({
 *   component: DefaultModal,
 *   componentProps: { type: 'question', title: '...', content: '...', buttons: [...] },
 * })
 *   .onOk(payload => {})
 *   .onCancel(payload => {})
 *   .onDismiss((result, payload) => {})
 *
 * A modal can also close itself (a countdown expiring, etc.) by calling onDialogOk()/onDialogCancel()
 * directly — no need to wait for the user to click a button. Attach a payload describing why, so the
 * call site can branch on it.
 */
import { shallowRef, type Component } from 'vue'

/** The kind of dialog — controls DefaultModal.vue's icon/color. */
export type DialogType = 'success' | 'question' | 'alert' | 'error'

/** 'submit' -> onOk(), 'cancel' -> onCancel() */
export type DialogButtonAction = 'submit' | 'cancel'

export interface IDialogButton {
  action: DialogButtonAction
  text: string
  /** Awaited before the dialog settles — the button shows a loading state meanwhile. */
  onClick?: () => void | Promise<void>
}

export type DialogResult = 'ok' | 'cancel'

export type DialogOkCallback<TOk = unknown> = (payload?: TOk) => void

export type DialogCancelCallback<TCancel = unknown> = (payload?: TCancel) => void

/** Fires every time a dialog closes, ok or cancel — for cleanup that must always run. */
export type DialogDismissCallback<TCancel = unknown, TOk = unknown> = (
  result: DialogResult,
  payload?: TCancel | TOk,
) => void

export interface DialogCreateOptions {
  /** The dialog's component — must call useDialogComponent() internally (see DefaultModal.vue). */
  component: Component
  /** Props passed straight through to the component. */
  componentProps?: Record<string, unknown>
}

/**
 * What Dialog.create() returns — chain .onOk()/.onCancel()/.onDismiss() onto it.
 *
 * The generic is the payload type each modal sends back; omit it and narrow from unknown instead.
 * TCancel comes before TOk because onCancel needs to know the reason more often than onOk does, so
 * a single generic is usually enough: Dialog.create<{ reason: 'expired' | 'close' }>({ ... }).
 * To type both: Dialog.create<{ reason: 'expired' | 'close' }, { code: string }>({ ... }).
 */
export interface DialogHandle<TCancel = unknown, TOk = unknown> {
  onOk: (callback: DialogOkCallback<TOk>) => DialogHandle<TCancel, TOk>
  onCancel: (callback: DialogCancelCallback<TCancel>) => DialogHandle<TCancel, TOk>
  onDismiss: (callback: DialogDismissCallback<TCancel, TOk>) => DialogHandle<TCancel, TOk>
}

export interface DialogInstance {
  id: number
  component: Component
  componentProps: Record<string, unknown>
  /** Closes the dialog: fires the registered callbacks, then removes itself from the stack. */
  close: (result: DialogResult, payload?: unknown) => void
}

// BaseModal.vue's close transition is 0.2s — give it time to finish before dropping the dialog from
// the stack.
const LEAVE_DURATION = 250

// shallowRef so Vue doesn't try to proxy the component definitions held inside (which means a new
// array must be assigned on every add/remove, instead of push/splice).
export const activeDialogs = shallowRef<DialogInstance[]>([])

let lastDialogId = 0

export const Dialog = {
  create<TCancel = unknown, TOk = unknown>({
    component,
    componentProps = {},
  }: DialogCreateOptions): DialogHandle<TCancel, TOk> {
    const id = ++lastDialogId
    const okCallbacks: DialogOkCallback<TOk>[] = []
    const cancelCallbacks: DialogCancelCallback<TCancel>[] = []
    const dismissCallbacks: DialogDismissCallback<TCancel, TOk>[] = []

    const instance: DialogInstance = {
      id,
      component,
      componentProps,
      close(result, payload) {
        // The engine doesn't know the payload's real type — that comes from the generic the call
        // site declared.
        if (result === 'ok') {
          okCallbacks.forEach((callback) => callback(payload as TOk))
        } else {
          cancelCallbacks.forEach((callback) => callback(payload as TCancel))
        }

        dismissCallbacks.forEach((callback) => callback(result, payload as TCancel | TOk))

        setTimeout(() => {
          activeDialogs.value = activeDialogs.value.filter((dialog) => dialog.id !== id)
        }, LEAVE_DURATION)
      },
    }

    activeDialogs.value = [...activeDialogs.value, instance]

    // Callbacks can be registered after create() returns — the dialog just went up, so it can't
    // possibly have already closed within this tick.
    const handle: DialogHandle<TCancel, TOk> = {
      onOk(callback) {
        okCallbacks.push(callback)
        return handle
      },
      onCancel(callback) {
        cancelCallbacks.push(callback)
        return handle
      },
      onDismiss(callback) {
        dismissCallbacks.push(callback)
        return handle
      },
    }

    return handle
  },
}

/**
 * Drops every open dialog immediately, WITHOUT firing onOk/onCancel/onDismiss — this is teardown,
 * not a user result. DialogHost.vue calls it on route change.
 */
export function closeAllDialogs(): void {
  activeDialogs.value = []
}

/**
 * Tracks which BaseModal/BaseBottomSheet instances are currently open, in open order, so a single
 * Escape keypress closes only the topmost one instead of every open dialog at once — each instance
 * keeps its own `document` keydown listener (see BaseModal.vue/BaseBottomSheet.vue), so without this
 * registry every listener would fire independently on the same event.
 *
 * Separate from activeDialogs above: that array holds dialog *descriptors* DialogHost renders,
 * while this one tracks DOM-level open/closed state — BaseModal/BaseBottomSheet register here
 * whether they're opened through Dialog.create() or mounted directly by a page.
 */
const openDialogIds: symbol[] = []

export function pushDialog(id: symbol): void {
  openDialogIds.push(id)
}

export function popDialog(id: symbol): void {
  const index = openDialogIds.lastIndexOf(id)
  if (index !== -1) openDialogIds.splice(index, 1)
}

export function isTopDialog(id: symbol): boolean {
  return openDialogIds[openDialogIds.length - 1] === id
}

/** Test-only: clears the stack so a dialog left open at the end of one spec file can't affect
 * another — call from `afterEach` in any spec that mounts BaseModal/BaseBottomSheet. */
export function clearDialogStackForTests(): void {
  openDialogIds.length = 0
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

/**
 * Keeps Tab/Shift+Tab cycling within `container` instead of leaking focus out to the page behind a
 * modal — call from a `keydown` listener with the panel element as `container`. No-op for any key
 * other than Tab.
 */
export function trapFocus(event: KeyboardEvent, container: HTMLElement): void {
  if (event.key !== 'Tab') return

  // Not filtered by offsetParent/visibility — the panel's content only exists in the DOM while the
  // dialog is open (v-if), so everything matching the selector here is already meant to be reachable.
  const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))

  // The panel itself (tabindex="-1") is the only focusable thing while empty — keep Tab from
  // leaving it rather than doing nothing.
  if (focusable.length === 0) {
    event.preventDefault()
    return
  }

  const first = focusable[0]!
  const last = focusable[focusable.length - 1]!
  const active = document.activeElement as HTMLElement | null

  if (event.shiftKey) {
    if (active === first || !active || !container.contains(active)) {
      event.preventDefault()
      last.focus()
    }
  } else if (active === last || !active || !container.contains(active)) {
    event.preventDefault()
    first.focus()
  }
}
