import { describe, expect, it } from 'vitest'
import { decodeJwt } from '@/utils/jwt'

function base64Url(value: object): string {
  return btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fakeJwt(header: object, payload: object, signature = 'sig'): string {
  return `${base64Url(header)}.${base64Url(payload)}.${signature}`
}

describe('decodeJwt', () => {
  it('decodes the header and payload of a well-formed token', () => {
    const token = fakeJwt({ alg: 'HS256' }, { scope: 'API', sub: 'user-1' })

    expect(decodeJwt(token)).toEqual({
      header: { alg: 'HS256' },
      payload: { scope: 'API', sub: 'user-1' },
    })
  })

  it('decodes a payload whose base64url segment needs padding', () => {
    // A payload length that lands on an unpadded base64url boundary.
    const token = fakeJwt({ alg: 'HS256' }, { a: 1 })

    expect(decodeJwt(token)?.payload).toEqual({ a: 1 })
  })

  it('returns null for a token missing a segment', () => {
    expect(decodeJwt('only.two')).toBeNull()
  })

  it('returns null for a token with an empty segment', () => {
    expect(decodeJwt('..sig')).toBeNull()
  })

  it('returns null when a segment is not valid base64url JSON', () => {
    expect(decodeJwt('not-base64.also-not-base64.sig')).toBeNull()
  })

  it('returns null for an empty string', () => {
    expect(decodeJwt('')).toBeNull()
  })
})
