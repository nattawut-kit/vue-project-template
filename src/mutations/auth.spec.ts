import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { PiniaColada } from '@pinia/colada'
import { login, type LoginResult } from '@/api/auth'
import { useLogin } from '@/mutations/auth'

vi.mock('@/api/auth', () => ({
  login: vi.fn<(liffToken: string) => Promise<LoginResult>>(),
}))

function mountUseLogin() {
  let mutation!: ReturnType<typeof useLogin>
  mount(
    defineComponent({
      setup() {
        mutation = useLogin()
        return () => null
      },
    }),
    { global: { plugins: [createPinia(), PiniaColada] } },
  )
  return mutation
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('useLogin', () => {
  it('calls login with the LIFF token and resolves its result', async () => {
    const result = { access_token: 'app.token', access_token_exp_time: 1 }
    vi.mocked(login).mockResolvedValue(result)
    const { mutateAsync } = mountUseLogin()

    await expect(mutateAsync('liff-token')).resolves.toBe(result)
    expect(login).toHaveBeenCalledWith('liff-token')
  })
})
