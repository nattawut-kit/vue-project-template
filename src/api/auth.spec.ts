import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiPost } from '@/api/client'
import { login } from '@/api/auth'

vi.mock('@/api/client', () => ({
  apiPost: vi.fn<(url: string, data?: unknown) => Promise<unknown>>(),
}))

afterEach(() => {
  vi.clearAllMocks()
})

describe('login', () => {
  it('posts the LIFF token and returns the app token', async () => {
    const result = { access_token: 'app.token', access_token_exp_time: 1 }
    vi.mocked(apiPost).mockResolvedValue(result)

    await expect(login('liff-token')).resolves.toBe(result)
    expect(apiPost).toHaveBeenCalledWith('/api/v1/internal/Authentication/Login', {
      liff_token: 'liff-token',
    })
  })

  it('lets an api error through', async () => {
    vi.mocked(apiPost).mockRejectedValue({ http_status: 401 })

    await expect(login('liff-token')).rejects.toMatchObject({ http_status: 401 })
  })
})
