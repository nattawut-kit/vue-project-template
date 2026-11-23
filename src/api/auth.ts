import { apiPost } from '@/api/client'

export interface LoginResult {
  access_token: string
  access_token_exp_time: number
  /** The scope of the issued token, when the backend issues scoped tokens. */
  scope?: string
}

// The ChocoCRM login swaps the LIFF access token for the app's own token. Rename the path and
// widen LoginResult to whatever the project's backend returns.
export function login(liffToken: string): Promise<LoginResult> {
  return apiPost<LoginResult>('/api/v1/internal/Authentication/Login', { liff_token: liffToken })
}
