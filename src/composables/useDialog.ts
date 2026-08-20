export interface DialogOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
}

// Shared across the app so any component can trigger the one global dialog instance.
const isOpen = ref(false)
const options = ref<DialogOptions | null>(null)

let resolveDialog: ((value: boolean) => void) | null = null

export const useDialog = () => {
  const confirm = (opts: DialogOptions): Promise<boolean> => {
    options.value = opts
    isOpen.value = true

    return new Promise(resolve => {
      resolveDialog = resolve
    })
  }

  const handleConfirm = () => {
    isOpen.value = false
    resolveDialog?.(true)
  }

  const handleCancel = () => {
    isOpen.value = false
    resolveDialog?.(false)
  }

  return { isOpen, options, confirm, handleConfirm, handleCancel }
}
