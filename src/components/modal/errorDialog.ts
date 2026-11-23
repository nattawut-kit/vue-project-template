import { isApiError } from '@/api/client'
import DefaultModal from './DefaultModal.vue'
import { Dialog, type DialogHandle, type IDialogButton } from './dialog'

const DEFAULT_ERROR_BUTTONS: IDialogButton[] = [{ action: 'submit', text: 'ปิด' }]

// A reload restarts the app from the landing page with no token. A LINE mini app that would rather
// close the LIFF window can call liff.closeWindow() here when liff.isInClient().
export function clearSessionAndRestart(): void {
  localStorage.clear()
  sessionStorage.clear()
  window.location.reload()
}

export interface ShowErrorDialogOptions {
  title?: string
  content?: string
  /** An error raised from an API call — DefaultModal reads its `locale['th-th']` as the default copy. */
  error?: unknown
  buttons?: IDialogButton[]
  onSubmit?: () => void | Promise<void>
  onCancel?: () => void | Promise<void>
}

export function showErrorDialog(options: ShowErrorDialogOptions = {}): DialogHandle {
  const { title, content, error, buttons = DEFAULT_ERROR_BUTTONS, onSubmit, onCancel } = options

  const handle = Dialog.create({
    component: DefaultModal,
    componentProps: { type: 'error', title, content, error, buttons },
  })

  if (isApiError(error) && error.http_status === 401) {
    handle.onOk(clearSessionAndRestart)
  }

  if (onSubmit) handle.onOk(onSubmit)
  if (onCancel) handle.onCancel(onCancel)

  return handle
}
