import { useRouter } from 'vue-router'
import liff from '@line/liff'
import type { IDialogButton } from '@/components/modal/dialog'
import {
  clearSessionAndRestart,
  showErrorDialog,
  type ShowErrorDialogOptions,
} from '@/components/modal/errorDialog'
import { isApiError } from '@/api/client'
import { useLogin } from '@/mutations/auth'
import { useAuthStore } from '@/stores/auth'
import { isRootPath, normalizeRedirectPath, safeDecode } from '@/utils/redirectPath'

const REDIRECT_STORAGE_KEY = 'liff_redirect_path'

// อ่านค่า ?redirect= จาก URL (หรือจาก liff.state ที่ LINE ห่อ query เดิมไว้) แล้วเก็บลง localStorage
// ไว้ก่อน เพราะ query จะหายไปหลังผ่าน liff.login() รับเฉพาะ path ในแอป (กัน open redirect และ
// ทิ้งค่า "/" เพราะคือ landing เอง) ดูกฎที่ normalizeRedirectPath
export function captureRedirectPath(): void {
  const params = new URLSearchParams(window.location.search)
  const liffState = params.get('liff.state')
  const decodedState = liffState ? safeDecode(liffState) : null
  const stateParams = decodedState ? new URLSearchParams(decodedState.replace(/^\?/, '')) : null

  const redirect = params.get('redirect') ?? stateParams?.get('redirect')
  if (!redirect) return

  const path = normalizeRedirectPath(redirect)
  if (path) localStorage.setItem(REDIRECT_STORAGE_KEY, path)
}

// อ่านค่า redirect ที่เก็บไว้แล้วลบทิ้งทันที ใช้ได้ครั้งเดียว
export function consumeRedirectPath(): string | null {
  const path = localStorage.getItem(REDIRECT_STORAGE_KEY)
  localStorage.removeItem(REDIRECT_STORAGE_KEY)
  // ค่า "/" ที่ค้างมาจากรอบก่อนพากลับ landing เอง ทิ้งไป ไปหน้า home แทน
  return path && !isRootPath(path) ? path : null
}

// LIFF errors carry a useful message of their own, an api error keeps the backend's copy.
function describeLoginFailure(cause: unknown): Pick<ShowErrorDialogOptions, 'error' | 'content'> {
  if (!isApiError(cause) && typeof cause === 'object' && cause !== null && 'message' in cause) {
    const { message } = cause
    if (typeof message === 'string' && message) return { content: message }
  }
  return { error: cause }
}

const RETRY_LATER_BUTTONS: IDialogButton[] = [{ action: 'submit', text: 'ลองใหม่อีกครั้งภายหลัง' }]

/**
 * LINE login: opens the LINE login when needed, swaps the LIFF access token for the app token,
 * keeps it, then goes to the parked `?redirect=` page or the home page.
 *
 * A project with onboarding (consent, register, ...) branches on `result.scope` right where the
 * token is kept, before the redirect.
 */
export function useLineLogin() {
  const authStore = useAuthStore()
  const router = useRouter()
  const { mutateAsync: login } = useLogin()

  function showLoginError(options: Pick<ShowErrorDialogOptions, 'error' | 'content'>): void {
    showErrorDialog({ ...options, buttons: RETRY_LATER_BUTTONS, onSubmit: clearSessionAndRestart })
  }

  async function loginWithLine(): Promise<void> {
    try {
      await liff.ready

      if (!liff.isLoggedIn()) {
        // captureRedirectPath() already parked ?redirect= in localStorage, no need to carry it here.
        const { protocol, host } = window.location
        liff.login({ redirectUri: `${protocol}//${host}` })
        return
      }

      const accessToken = liff.getAccessToken()

      if (!accessToken) {
        showLoginError({ content: 'ไม่พบ access token จาก LINE' })
        return
      }

      // DEV only: handy for calling the api outside the app, never log it in production.
      if (import.meta.env.DEV) console.info('[LIFF] - Access Token : ', accessToken)

      try {
        const result = await login(accessToken)
        authStore.setToken(result.access_token)

        const redirectPath = consumeRedirectPath()
        await router.replace(redirectPath ?? { name: '/home' })
      } catch (error) {
        showLoginError({ error })
      }
    } catch (cause) {
      showLoginError(describeLoginFailure(cause))
    }
  }

  return { loginWithLine }
}
