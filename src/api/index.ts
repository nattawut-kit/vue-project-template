import axios, { type AxiosError } from 'axios'

export interface ApiError {
  status: number
  message: string
}

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

httpClient.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    const apiError: ApiError = {
      status: error.response?.status ?? 0,
      message: error.response?.statusText || error.message,
    }
    return Promise.reject(apiError)
  }
)

export const apiGet = async <T>(path: string): Promise<T> => {
  const res = await httpClient.get<T>(path)
  return res.data
}

export const apiPost = async <T>(path: string, body: unknown): Promise<T> => {
  const res = await httpClient.post<T>(path, body)
  return res.data
}
