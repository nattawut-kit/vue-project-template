import { describe, expect, it } from 'vitest'
import { isRootPath, normalizeRedirectPath, safeDecode } from '@/utils/redirectPath'

describe('isRootPath', () => {
  it('is true for the root, with or without a query or hash', () => {
    expect(isRootPath('/')).toBe(true)
    expect(isRootPath('/?a=1')).toBe(true)
    expect(isRootPath('/#top')).toBe(true)
  })

  it('is false for any other path', () => {
    expect(isRootPath('/home')).toBe(false)
    expect(isRootPath('/profile/contact')).toBe(false)
  })
})

describe('safeDecode', () => {
  it('decodes a percent-encoded value', () => {
    expect(safeDecode('%3Fredirect%3D%2Fprofile')).toBe('?redirect=/profile')
  })

  it('is null instead of throwing on malformed input', () => {
    expect(safeDecode('%E0%A4%A')).toBeNull()
    expect(safeDecode('%3Fredirect%3D%25E0')).toBe('?redirect=%E0')
  })
})

describe('normalizeRedirectPath', () => {
  it('keeps an in-app path', () => {
    expect(normalizeRedirectPath('/profile')).toBe('/profile')
    expect(normalizeRedirectPath('/orders/OD_1?tab=C1')).toBe('/orders/OD_1?tab=C1')
  })

  it('adds the leading slash', () => {
    expect(normalizeRedirectPath('profile')).toBe('/profile')
  })

  it('decodes a percent-encoded path', () => {
    expect(normalizeRedirectPath('%2Fprofile%2Fcontact')).toBe('/profile/contact')
  })

  it('ignores the root, which is the landing page itself', () => {
    expect(normalizeRedirectPath('/')).toBeNull()
    expect(normalizeRedirectPath('%2F')).toBeNull()
  })

  it('rejects protocol-relative and backslash paths', () => {
    expect(normalizeRedirectPath('//evil.com')).toBeNull()
    expect(normalizeRedirectPath('/\\evil.com')).toBeNull()
  })

  it('ignores empty and malformed values', () => {
    expect(normalizeRedirectPath('')).toBeNull()
    expect(normalizeRedirectPath('%E0%A4%A')).toBeNull()
  })
})
