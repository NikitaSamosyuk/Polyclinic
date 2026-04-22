// src/api/auth.ts
import api from './axios'

export interface LoginResponse {
  accessToken?: string
  // другие поля, которые возвращает бэкенд
  [key: string]: any
}

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await api.post('/auth/login', { email, password })
    return res.data
  },

  async register(username: string, email: string, password: string): Promise<LoginResponse> {
    const res = await api.post('/auth/register', { username, email, password })
    return res.data
  },

  async me(): Promise<any> {
    const res = await api.get('/auth/me')
    return res.data
  },

  async logout(): Promise<any> {
    const res = await api.post('/auth/logout')
    return res.data
  },

  async refresh(): Promise<LoginResponse> {
    const res = await api.post('/auth/refresh')
    return res.data
  },
}
