// src/api/axios.ts
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
  timeout: 10000,
})

// Добавляем токен из localStorage — это надёжнее при раннем импорте модулей
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken') // <- убедись, что токен сохраняется под этим ключом
  config.headers = config.headers || {}
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // отключаем кэширование по умолчанию для разработки
  config.headers['Cache-Control'] = 'no-cache'
  config.headers.Pragma = 'no-cache'

  // лог для отладки (удали в проде)
  // eslint-disable-next-line no-console
  console.log('[api] Request', config.method, config.url, 'Headers:', config.headers)

  return config
})

// опционально: централизованная обработка 401 (можно редиректить на логин)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // eslint-disable-next-line no-console
      console.warn('[api] Unauthorized (401). Clearing token and redirecting to login.')
      // при необходимости: localStorage.removeItem('accessToken')
      // и/или window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

export default api
