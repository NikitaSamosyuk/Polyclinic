import axios from 'axios'
import { useAuthStore } from '../store/auth.store'

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.accessToken) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${auth.accessToken}`
  }
  return config
})

export default api
