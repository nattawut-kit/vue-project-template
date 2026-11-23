import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useQueryCache } from '@pinia/colada'
import { TOKEN_STORAGE_KEY } from '@/api/client'
import { decodeJwt } from '@/utils/jwt'

interface AuthTokenPayload {
  scope?: unknown
}

function readStoredToken(): string | null {
  return sessionStorage.getItem(TOKEN_STORAGE_KEY)
}

export const useAuthStore = defineStore('auth', () => {
  const queryCache = useQueryCache()
  const token = ref<string | null>(readStoredToken())

  const isAuthenticated = computed(() => token.value !== null)

  // Read from the JWT so a project whose backend issues scoped tokens (register vs app, ...) can
  // route on it without another call. The signature is not checked here, the backend does that.
  const scope = computed<string | null>(() => {
    if (!token.value) return null
    const payloadScope = decodeJwt<AuthTokenPayload>(token.value)?.payload.scope
    return typeof payloadScope === 'string' ? payloadScope : null
  })

  // `refetchActive: false` marks the cache stale without refetching what is on screen, for a token
  // swap that runs while the page being left is still mounted.
  function setToken(value: string, { refetchActive = true }: { refetchActive?: boolean } = {}) {
    token.value = value
    sessionStorage.setItem(TOKEN_STORAGE_KEY, value)
    void queryCache.invalidateQueries(undefined, refetchActive)
  }

  function clearToken() {
    token.value = null
    sessionStorage.removeItem(TOKEN_STORAGE_KEY)
    void queryCache.invalidateQueries()
  }

  return { token, scope, isAuthenticated, setToken, clearToken }
})
