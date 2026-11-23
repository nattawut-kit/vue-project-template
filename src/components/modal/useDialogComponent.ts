import { onMounted, ref, watch } from 'vue'
import type { DialogResult } from './dialog'

/**
 * The emit shape a dialog component must declare and pass into useDialogComponent():
 * defineEmits<{ ok: [payload?: unknown]; cancel: [payload?: unknown] }>()
 *
 * Written as an overload to match what defineEmits generates (a plain union wouldn't be assignable).
 */
export type DialogComponentEmit = {
  (event: 'ok', payload?: unknown): void
  (event: 'cancel', payload?: unknown): void
}

/**
 * Used inside a component opened via Dialog.create() — returns `visible` for BaseModal's v-model,
 * plus handlers that close the dialog and report the result back to .onOk()/.onCancel().
 *
 * Closing via backdrop/Esc (visible becomes false on its own) counts as a cancel.
 *
 * Can close itself at any time, without waiting for a button click — e.g. a countdown expiring can
 * call onDialogCancel({ reason: 'expired' }) so the call site can tell it apart from a manual close.
 */
export function useDialogComponent(emit: DialogComponentEmit) {
  // Starts false, then flips true after mount so the enter transition plays.
  const visible = ref(false)

  let isSettled = false

  function settle(result: DialogResult, payload?: unknown): void {
    if (isSettled) return

    isSettled = true
    visible.value = false

    // Branches because an overload can't be called with a plain union variable directly.
    if (result === 'ok') {
      emit('ok', payload)
    } else {
      emit('cancel', payload)
    }
  }

  onMounted(() => {
    visible.value = true
  })

  watch(visible, (value) => {
    if (!value) settle('cancel')
  })

  return {
    visible,
    onDialogOk: (payload?: unknown) => settle('ok', payload),
    onDialogCancel: (payload?: unknown) => settle('cancel', payload),
  }
}
