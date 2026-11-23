import type { AxiosError } from 'axios'
import { describe, expect, it } from 'vitest'
import {
  type ApiEnvelope,
  type ApiErrorResponse,
  getErrorDisplay,
  isApiError,
  isCanceledError,
  isTimeoutError,
  toApiError,
} from '@/api/client'

function makeApiErrorResponse(overrides: Partial<ApiErrorResponse> = {}): ApiErrorResponse {
  return {
    code: 1000400,
    subcode: null,
    http_status: 400,
    system: 'Bad request',
    message: 'Bad request',
    validate: null,
    ...overrides,
  }
}

function makeAxiosError(
  overrides: Partial<AxiosError<ApiEnvelope<unknown>>> = {},
): AxiosError<ApiEnvelope<unknown>> {
  return {
    name: 'AxiosError',
    message: 'Request failed',
    isAxiosError: true,
    toJSON: () => ({}),
    ...overrides,
  } as AxiosError<ApiEnvelope<unknown>>
}

describe('toApiError', () => {
  it('passes through the error the backend sent in the envelope', () => {
    const backendError = makeApiErrorResponse({ code: 1000404, message: 'Customer not found' })
    const error = makeAxiosError({ response: { data: { error: backendError } } as never })

    expect(toApiError(error)).toBe(backendError)
  })

  it('normalizes a canceled request', () => {
    const error = makeAxiosError({ code: 'ERR_CANCELED' })

    expect(toApiError(error)).toMatchObject({ code: 'ERR_CANCELED', http_status: 0 })
  })

  it('normalizes a timeout', () => {
    const error = makeAxiosError({ code: 'ECONNABORTED' })

    expect(toApiError(error)).toMatchObject({ code: 'TIMEOUT', http_status: 408 })
  })

  it('normalizes a network failure with no response', () => {
    const error = makeAxiosError({ code: 'ERR_NETWORK' })

    expect(toApiError(error)).toMatchObject({ code: 'ERR_NETWORK', http_status: 0 })
  })

  it('normalizes a response that never followed the envelope', () => {
    const error = makeAxiosError({
      code: 'ERR_BAD_RESPONSE',
      response: { status: 502, data: undefined } as never,
    })

    expect(toApiError(error)).toMatchObject({ code: 'ERR_BAD_RESPONSE', http_status: 502 })
  })
})

describe('isApiError', () => {
  it('recognizes a normalized error', () => {
    expect(isApiError(makeApiErrorResponse())).toBe(true)
  })

  it('rejects a plain Error', () => {
    expect(isApiError(new Error('boom'))).toBe(false)
  })

  it('rejects null and undefined', () => {
    expect(isApiError(null)).toBe(false)
    expect(isApiError(undefined)).toBe(false)
  })
})

describe('isTimeoutError', () => {
  it('is true only for a TIMEOUT code', () => {
    expect(isTimeoutError(makeApiErrorResponse({ code: 'TIMEOUT' }))).toBe(true)
    expect(isTimeoutError(makeApiErrorResponse({ code: 'ERR_NETWORK' }))).toBe(false)
  })
})

describe('isCanceledError', () => {
  it('is true only for an ERR_CANCELED code', () => {
    expect(isCanceledError(makeApiErrorResponse({ code: 'ERR_CANCELED' }))).toBe(true)
    expect(isCanceledError(makeApiErrorResponse({ code: 'TIMEOUT' }))).toBe(false)
  })
})

describe('getErrorDisplay', () => {
  it('reads the title and message off a normalized error', () => {
    const error = makeApiErrorResponse({ system: 'ลูกค้าไม่พบ', message: 'ไม่พบข้อมูลลูกค้า' })

    expect(getErrorDisplay(error)).toEqual({ title: 'ลูกค้าไม่พบ', message: 'ไม่พบข้อมูลลูกค้า' })
  })

  it('falls back to a generic message for a non-api error', () => {
    expect(getErrorDisplay(new Error('boom'))).toEqual({
      title: 'เกิดข้อผิดพลาด',
      message: 'ระบบขัดข้อง กรุณาลองใหม่ภายหลัง',
    })
  })
})
