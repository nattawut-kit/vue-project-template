import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'

export interface ApiErrorLocale {
  title: string
  message: string
}

export interface ApiErrorResponse {
  /**
   * Backend errors carry a numeric code (e.g. 1000400).
   * Failures that never reached the backend carry a string code
   * ('TIMEOUT' | 'ERR_NETWORK' | 'ERR_CANCELED' | an axios code).
   */
  code: number | string
  subcode: number | null
  http_status: number
  system: string
  message: string
  locale: Record<string, ApiErrorLocale> | null
  /** Field-level validation detail — shape is endpoint-specific, narrow it at the call site */
  validate: unknown
}

export type ApiEnvelope<T> =
  | { request_id?: string; status: 'success'; data: T; error: null }
  | { request_id?: string; status: 'fail'; data: null; error: ApiErrorResponse }

const DEFAULT_LOCALE = 'th-th'
const FALLBACK_LOCALE = 'en-us'

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

/**
 * Builds an error for a failure the backend never saw (timeout, network, cancel).
 * It fills in `locale` the same way the backend does, so `getErrorDisplay` needs
 * only one code path regardless of where the failure came from.
 */
const clientError = (
  code: string,
  httpStatus: number,
  th: ApiErrorLocale,
  en: ApiErrorLocale
): ApiErrorResponse => ({
  code,
  subcode: null,
  http_status: httpStatus,
  system: en.title,
  message: en.message,
  locale: { [DEFAULT_LOCALE]: th, [FALLBACK_LOCALE]: en },
  validate: null,
})

const toApiError = (error: AxiosError<ApiEnvelope<unknown>>): ApiErrorResponse => {
  const fromBody = error.response?.data?.error
  if (fromBody) return fromBody

  if (error.code === 'ERR_CANCELED') {
    return clientError(
      'ERR_CANCELED',
      0,
      { title: 'ยกเลิกคำขอ', message: 'คำขอถูกยกเลิก' },
      { title: 'Request canceled', message: 'The request was canceled' }
    )
  }

  if (error.code === 'ECONNABORTED') {
    return clientError(
      'TIMEOUT',
      408,
      { title: 'เชื่อมต่อไม่สำเร็จ', message: 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง' },
      { title: 'Request timeout', message: error.message }
    )
  }

  if (!error.response) {
    return clientError(
      'ERR_NETWORK',
      0,
      { title: 'เชื่อมต่อไม่สำเร็จ', message: 'กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต' },
      { title: 'Network error', message: error.message }
    )
  }

  // Reached the server, but the body did not follow the envelope (gateway HTML, 502, etc.)
  return clientError(
    error.code ?? 'ERR_UNKNOWN',
    error.response.status,
    { title: 'เกิดข้อผิดพลาด', message: 'ระบบขัดข้อง กรุณาลองใหม่ภายหลัง' },
    { title: error.response.statusText || 'Error', message: error.message }
  )
}

httpClient.interceptors.response.use(
  response => response,
  (error: AxiosError<ApiEnvelope<unknown>>) => Promise.reject(toApiError(error))
)

export const isApiError = (error: unknown): error is ApiErrorResponse =>
  typeof error === 'object' && error !== null && 'http_status' in error

export const isTimeoutError = (error: unknown): boolean =>
  isApiError(error) && error.code === 'TIMEOUT'

export const isCanceledError = (error: unknown): boolean =>
  isApiError(error) && error.code === 'ERR_CANCELED'

/**
 * Resolves the copy to show the user, preferring the backend's own `locale` block.
 * Falls back: exact locale -> same language -> en-us -> first available -> system/message.
 */
export const getErrorDisplay = (error: unknown, locale = DEFAULT_LOCALE): ApiErrorLocale => {
  if (!isApiError(error)) {
    return { title: 'เกิดข้อผิดพลาด', message: 'ระบบขัดข้อง กรุณาลองใหม่ภายหลัง' }
  }

  const entries = error.locale
  if (entries) {
    const exact = entries[locale]
    if (exact) return exact

    const language = locale.split('-')[0]
    const sameLanguage = Object.keys(entries).find(key => key.startsWith(language))
    if (sameLanguage) return entries[sameLanguage]

    const fallback = entries[FALLBACK_LOCALE] ?? Object.values(entries)[0]
    if (fallback) return fallback
  }

  return { title: error.system, message: error.message }
}

const request = async <T>(config: AxiosRequestConfig): Promise<T> => {
  // axios only sets the multipart boundary itself when no Content-Type is present
  const headers =
    config.data instanceof FormData
      ? { ...config.headers, 'Content-Type': undefined }
      : config.headers

  const response = await httpClient.request<ApiEnvelope<T>>({ ...config, headers })
  const envelope = response.data

  if (envelope.status === 'fail') {
    throw envelope.error
  }

  return envelope.data
}

export const apiGet = <T>(url: string, config?: AxiosRequestConfig) =>
  request<T>({ ...config, method: 'GET', url })

export const apiPost = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  request<T>({ ...config, method: 'POST', url, data })

export const apiPut = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  request<T>({ ...config, method: 'PUT', url, data })

export const apiPatch = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  request<T>({ ...config, method: 'PATCH', url, data })

export const apiDelete = <T>(url: string, config?: AxiosRequestConfig) =>
  request<T>({ ...config, method: 'DELETE', url })
