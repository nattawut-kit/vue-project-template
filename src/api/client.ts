import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'

export interface ApiErrorLocale {
  title: string
  message: string
}

export interface ApiErrorResponse {
  code: number | string
  subcode: number | null
  http_status: number
  system: string
  message: string
  /** Per-locale display copy the backend attaches to its own errors (e.g. `th-th`). */
  locale?: Record<string, ApiErrorLocale> | null
  validate: unknown
}

export type ApiEnvelope<T> =
  | { request_id?: string; status: 'success'; data: T; error: null }
  | { request_id?: string; status: 'fail'; data: null; error: ApiErrorResponse }

/** Where the bearer token lives, shared with `stores/auth.ts` so the two never drift apart. */
export const TOKEN_STORAGE_KEY = 'app_token'

/** The locale key the backend uses for the copy in `ApiErrorResponse.locale`. */
const ERROR_LOCALE = 'th-th'

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

function attachAuthToken(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const token = sessionStorage.getItem(TOKEN_STORAGE_KEY)
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
}

httpClient.interceptors.request.use(attachAuthToken)

function clientError(
  code: string,
  httpStatus: number,
  title: string,
  message: string,
): ApiErrorResponse {
  return {
    code,
    subcode: null,
    http_status: httpStatus,
    system: title,
    message,
    validate: null,
  }
}

export function offlineError(): ApiErrorResponse {
  return clientError('ERR_NETWORK', 0, 'เชื่อมต่อไม่สำเร็จ', 'กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต')
}

export function toApiError(error: AxiosError<ApiEnvelope<unknown>>): ApiErrorResponse {
  const fromBody = error.response?.data?.error
  if (fromBody) return fromBody

  if (error.code === 'ERR_CANCELED') {
    return clientError('ERR_CANCELED', 0, 'ยกเลิกคำขอ', 'คำขอถูกยกเลิก')
  }

  if (error.code === 'ECONNABORTED') {
    return clientError('TIMEOUT', 408, 'เชื่อมต่อไม่สำเร็จ', 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง')
  }

  if (!error.response) {
    if (!navigator.onLine) return offlineError()

    return clientError('ERR_NETWORK', 0, 'เกิดข้อผิดพลาด', 'ระบบขัดข้อง กรุณาลองใหม่ภายหลัง')
  }

  // Reached the server, but the body did not follow the envelope (gateway HTML, 502, etc.)
  return clientError(
    error.code ?? 'ERR_UNKNOWN',
    error.response.status,
    'เกิดข้อผิดพลาด',
    'ระบบขัดข้อง กรุณาลองใหม่ภายหลัง',
  )
}

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiEnvelope<unknown>>) => Promise.reject(toApiError(error)),
)

export function isApiError(error: unknown): error is ApiErrorResponse {
  return typeof error === 'object' && error !== null && 'http_status' in error
}

export function isTimeoutError(error: unknown): boolean {
  return isApiError(error) && error.code === 'TIMEOUT'
}

export function isCanceledError(error: unknown): boolean {
  return isApiError(error) && error.code === 'ERR_CANCELED'
}

/** Resolves the copy to show the user, falling back to a generic message for a non-api error. */
export function getErrorDisplay(error: unknown): ApiErrorLocale {
  if (!isApiError(error)) {
    return {
      title: 'เกิดข้อผิดพลาด',
      message: 'ระบบขัดข้อง กรุณาลองใหม่ภายหลัง',
    }
  }

  return error.locale?.[ERROR_LOCALE] ?? { title: error.system, message: error.message }
}

async function request<T>(config: AxiosRequestConfig): Promise<T> {
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

export async function apiRaw<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await httpClient.request<T>(config)
  return response.data
}

export function apiGet<T>(url: string, config?: AxiosRequestConfig) {
  return request<T>({ ...config, method: 'GET', url })
}

export function apiPost<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
  return request<T>({ ...config, method: 'POST', url, data })
}

export function apiPut<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
  return request<T>({ ...config, method: 'PUT', url, data })
}

export function apiPatch<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
  return request<T>({ ...config, method: 'PATCH', url, data })
}

export function apiDelete<T>(url: string, config?: AxiosRequestConfig) {
  return request<T>({ ...config, method: 'DELETE', url })
}
