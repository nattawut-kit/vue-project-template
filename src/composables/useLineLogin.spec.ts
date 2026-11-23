import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { PiniaColada } from '@pinia/colada'
import liff from '@line/liff'
import { login, type LoginResult } from '@/api/auth'
import { TOKEN_STORAGE_KEY } from '@/api/client'
import { activeDialogs, closeAllDialogs } from '@/components/modal/dialog'
import { useAuthStore } from '@/stores/auth'
import { captureRedirectPath, consumeRedirectPath, useLineLogin } from './useLineLogin'

const replace = vi.fn<(to: unknown) => Promise<void>>().mockResolvedValue(undefined)

vi.mock('vue-router', () => ({
  useRouter: () => ({ replace }),
}))

vi.mock('@line/liff', () => ({
  default: {
    ready: Promise.resolve(),
    isLoggedIn: vi.fn<() => boolean>(),
    login: vi.fn<(options: { redirectUri: string }) => void>(),
    getAccessToken: vi.fn<() => string | null>(),
  },
}))

vi.mock('@/api/auth', () => ({
  login: vi.fn<(liffToken: string) => Promise<LoginResult>>(),
}))

const LOGIN_RESULT: LoginResult = { access_token: 'system.token', access_token_exp_time: 1 }

function mountLogin() {
  const pinia = createPinia()
  setActivePinia(pinia)
  let composable!: ReturnType<typeof useLineLogin>
  mount(
    defineComponent({
      setup() {
        composable = useLineLogin()
        return () => null
      },
    }),
    { global: { plugins: [pinia, PiniaColada] } },
  )
  return composable
}

beforeEach(() => {
  sessionStorage.clear()
  localStorage.clear()
  vi.mocked(liff.isLoggedIn).mockReturnValue(true)
  vi.mocked(liff.getAccessToken).mockReturnValue('liff-token')
  vi.mocked(login).mockResolvedValue(LOGIN_RESULT)
})

afterEach(() => {
  closeAllDialogs()
  vi.clearAllMocks()
})

describe('useLineLogin', () => {
  it('opens the LINE login and goes no further when the user is not logged in', async () => {
    vi.mocked(liff.isLoggedIn).mockReturnValue(false)
    const { loginWithLine } = mountLogin()

    await loginWithLine()

    expect(liff.login).toHaveBeenCalledWith({ redirectUri: expect.stringContaining('//') })
    expect(login).not.toHaveBeenCalled()
  })

  it('shows a popup and does not call the api when LINE gives no access token', async () => {
    vi.mocked(liff.getAccessToken).mockReturnValue(null)
    const { loginWithLine } = mountLogin()

    await loginWithLine()

    expect(activeDialogs.value).toHaveLength(1)
    expect(login).not.toHaveBeenCalled()
  })

  it('exchanges the LIFF access token for the app token, keeps it and goes home', async () => {
    const { loginWithLine } = mountLogin()

    await loginWithLine()

    expect(login).toHaveBeenCalledWith('liff-token')
    expect(useAuthStore().token).toBe('system.token')
    expect(replace).toHaveBeenCalledWith({ name: '/home' })
  })

  it('goes to the page parked in ?redirect=, once', async () => {
    localStorage.setItem('liff_redirect_path', '/profile')
    const { loginWithLine } = mountLogin()

    await loginWithLine()

    expect(replace).toHaveBeenCalledWith('/profile')
    expect(localStorage.getItem('liff_redirect_path')).toBeNull()
  })

  it('shows the message LIFF gives when LIFF itself fails', async () => {
    vi.mocked(liff.getAccessToken).mockImplementation(() => {
      throw new Error('LIFF is not ready')
    })
    const { loginWithLine } = mountLogin()

    await loginWithLine()

    expect(activeDialogs.value[0]!.componentProps).toMatchObject({ content: 'LIFF is not ready' })
  })

  it('shows the error in a popup and keeps no token when the login fails', async () => {
    vi.mocked(login).mockRejectedValue({ http_status: 401, code: 1000401 })
    const { loginWithLine } = mountLogin()

    await loginWithLine()
    await flushPromises()

    expect(activeDialogs.value).toHaveLength(1)
    expect(useAuthStore().token).toBeNull()
    expect(replace).not.toHaveBeenCalled()
  })

  it('clears the session and reloads when the user closes the error popup', async () => {
    const reload = vi.fn<() => void>()
    vi.stubGlobal('location', { ...window.location, reload })
    vi.mocked(login).mockRejectedValue(new Error('boom'))
    sessionStorage.setItem(TOKEN_STORAGE_KEY, 'old')
    const { loginWithLine } = mountLogin()

    await loginWithLine()
    activeDialogs.value[0]!.close('ok')
    await flushPromises()

    expect(sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull()
    expect(reload).toHaveBeenCalledOnce()
    vi.unstubAllGlobals()
  })
})

describe('captureRedirectPath / consumeRedirectPath', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/')
  })

  it('parks a redirect from the query and hands it over once', () => {
    window.history.replaceState({}, '', '/?redirect=/profile')

    captureRedirectPath()

    expect(consumeRedirectPath()).toBe('/profile')
    expect(consumeRedirectPath()).toBeNull()
  })

  it('never parks a redirect that leaves the app', () => {
    window.history.replaceState({}, '', '/?redirect=https://evil.example')

    captureRedirectPath()

    const parked = consumeRedirectPath()
    expect(parked === null || /^\/(?!\/)/.test(parked)).toBe(true)
  })
})
