import { afterEach, describe, expect, it, vi } from 'vitest'
import { createPinia } from 'pinia'
import { PiniaColada, useQueryCache } from '@pinia/colada'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { TOKEN_STORAGE_KEY } from '@/api/client'
import { useAuthStore } from '@/stores/auth'

function base64Url(value: object): string {
  return btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fakeJwt(payload: object): string {
  return `${base64Url({ alg: 'HS256' })}.${base64Url(payload)}.sig`
}

function mountAuthStore() {
  const pinia = createPinia()
  let queryCache: ReturnType<typeof useQueryCache>

  const HostComponent = defineComponent({
    setup() {
      queryCache = useQueryCache()
      return useAuthStore()
    },
    template: '<i />',
  })

  const wrapper = mount(HostComponent, { global: { plugins: [pinia, PiniaColada] } })
  return { auth: wrapper.vm, queryCache: queryCache! }
}

describe('useAuthStore', () => {
  afterEach(() => {
    sessionStorage.clear()
    vi.restoreAllMocks()
  })

  it('starts unauthenticated with no stored token', () => {
    const { auth } = mountAuthStore()

    expect(auth.token).toBeNull()
    expect(auth.scope).toBeNull()
    expect(auth.isAuthenticated).toBe(false)
  })

  it('picks up a token already in session storage', () => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, fakeJwt({ scope: 'app' }))

    const { auth } = mountAuthStore()

    expect(auth.isAuthenticated).toBe(true)
    expect(auth.scope).toBe('app')
  })

  it('sets the token and persists it', () => {
    const { auth } = mountAuthStore()

    auth.setToken(fakeJwt({ scope: 'register' }))

    expect(auth.isAuthenticated).toBe(true)
    expect(auth.scope).toBe('register')
    expect(sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBe(fakeJwt({ scope: 'register' }))
  })

  it('has no scope for a token that is not a well-formed JWT', () => {
    const { auth } = mountAuthStore()

    auth.setToken('not-a-jwt')

    expect(auth.isAuthenticated).toBe(true)
    expect(auth.scope).toBeNull()
  })

  it('has no scope when the claim is missing or not a string', () => {
    const { auth } = mountAuthStore()

    auth.setToken(fakeJwt({}))
    expect(auth.scope).toBeNull()

    auth.setToken(fakeJwt({ scope: 42 }))
    expect(auth.scope).toBeNull()
  })

  it('clears the token from state and storage', () => {
    const { auth } = mountAuthStore()
    auth.setToken(fakeJwt({ scope: 'app' }))

    auth.clearToken()

    expect(auth.token).toBeNull()
    expect(auth.isAuthenticated).toBe(false)
    expect(sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull()
  })

  it('invalidates the query cache on set and clear', () => {
    const { auth, queryCache } = mountAuthStore()
    const invalidate = vi.spyOn(queryCache, 'invalidateQueries')

    auth.setToken('a.b.c')
    auth.setToken('a.b.c', { refetchActive: false })
    auth.clearToken()

    expect(invalidate).toHaveBeenNthCalledWith(1, undefined, true)
    expect(invalidate).toHaveBeenNthCalledWith(2, undefined, false)
    expect(invalidate).toHaveBeenCalledTimes(3)
  })
})
