// src/api/axios.ts
import axios from 'axios'

let loggedOut = false
export function markLoggedOut() {
  loggedOut = true
}

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 10000,
})

let isRefreshing = false
let failedQueue: { resolve: (token: string) => void; reject: (err: any) => void }[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error)
    else p.resolve(token as string)
  })
  failedQueue = []
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  config.headers = config.headers || {}
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config
    if (!originalRequest) return Promise.reject(err)

    const status = err.response?.status
    const path = new URL(originalRequest.url, window.location.origin).pathname

    const isAuthRequest =
      path.startsWith('/api/auth/') ||
      path === '/api/users/password'

    // ❗ refresh запрещён после logout
    if (loggedOut) return Promise.reject(err)

    // ❗ Ошибки auth-запросов не трогаем
    if (status === 401 && isAuthRequest) return Promise.reject(err)

    // ❗ Если мы на /auth — не делаем refresh
    if (window.location.pathname === '/auth') return Promise.reject(err)

    // ❗ Refresh токена
    if (status === 401 && !originalRequest._retry && !isAuthRequest) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((e) => Promise.reject(e))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshRes = await api.post('/auth/refresh')
        const newAccess = refreshRes.data?.accessToken
        if (!newAccess) throw new Error('No access token from refresh')

        localStorage.setItem('accessToken', newAccess)
        processQueue(null, newAccess)
        originalRequest.headers.Authorization = `Bearer ${newAccess}`
        return api(originalRequest)
      } catch (refreshErr) {
        processQueue(refreshErr, null)
        localStorage.removeItem('accessToken')
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(err)
  },
)

export default api
