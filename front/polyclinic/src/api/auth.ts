// src/api/auth.ts
import api from './axios'

export const authApi = {
  async login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password })
    return res.data
  },

  async register(username: string, email: string, password: string) {
    const res = await api.post('/auth/register', { username, email, password })
    return res.data
  },

  async me() {
    const res = await api.get('/auth/me')
    return res.data
  },

  async logout() {
    const res = await api.post('/auth/logout')
    return res.data
  },

  async refresh() {
    const res = await api.post('/auth/refresh')
    return res.data
  },
}
