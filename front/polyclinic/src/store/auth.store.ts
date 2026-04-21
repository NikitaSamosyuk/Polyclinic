import { defineStore } from 'pinia'
import api from '../api/axios'

export interface User {
  id: number
  email: string
  username: string
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN'
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: (localStorage.getItem('accessToken') as string) || null,
    user: null as User | null,
  }),

  actions: {
    async login(email: string, password: string) {
      const res = await api.post('/auth/login', { email, password })
      this.accessToken = res.data.accessToken
      localStorage.setItem('accessToken', this.accessToken as string)
      await this.loadMe()
    },

    async register(username: string, email: string, password: string) {
      const res = await api.post('/auth/register', { username, email, password })
      this.accessToken = res.data.accessToken
      localStorage.setItem('accessToken', this.accessToken as string)
      await this.loadMe()
    },

    async loadMe() {
      if (!this.accessToken) return

      try {
        const res = await api.get('/auth/me')
        this.user = res.data
      } catch {
        this.user = null
      }
    },

    forceLocalLogout() {
      this.accessToken = null
      this.user = null
      localStorage.removeItem('accessToken')
    },

    async logout() {
      this.forceLocalLogout()
      api.post('/auth/logout').catch(() => {})
    },
  },
})
