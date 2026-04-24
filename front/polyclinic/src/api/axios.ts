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
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error)
    else p.resolve(token)
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
    const original = err.config
    if (!original) return Promise.reject(err)

    const status = err.response?.status
    const fullPath = original.baseURL + original.url // ← ВАЖНО
    const isAuthRequest =
      fullPath.startsWith('/api/auth/') ||
      fullPath === '/api/users/password'

    // После logout refresh запрещён
    if (loggedOut) return Promise.reject(err)

    // Ошибки auth-запросов НЕ трогаем
    if (status === 401 && isAuthRequest) return Promise.reject(err)

    // Refresh токена
    if (status === 401 && !original._retry && !isAuthRequest) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`
            return api(original)
          })
          .catch((e) => Promise.reject(e))
      }

      original._retry = true
      isRefreshing = true

      try {
        const refreshRes = await api.post('/auth/refresh')
        const newAccess = refreshRes.data?.accessToken
        if (!newAccess) throw new Error('No access token from refresh')

        localStorage.setItem('accessToken', newAccess)
        processQueue(null, newAccess)
        original.headers.Authorization = `Bearer ${newAccess}`
        return api(original)
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
