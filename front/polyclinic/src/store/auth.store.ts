import { defineStore } from 'pinia'
import { authApi } from '@/api/auth'
import { markLoggedOut } from '@/api/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('accessToken'),
    user: null as null | {
      id: number
      email: string
      username: string
      role: 'PATIENT' | 'DOCTOR' | 'ADMIN'
      isActive?: boolean
      user?: { isActive: boolean }
    },
    ready: false,
  }),

  actions: {
    async login(email: string, password: string) {
      try {
        const res = await authApi.login(email, password)
        const access = res.accessToken
        if (!access) return false

        this.accessToken = access
        localStorage.setItem('accessToken', access)

        return await this.loadMe()
      } catch {
        return false
      }
    },

    async register(username: string, email: string, password: string) {
      try {
        const res = await authApi.register(username, email, password)
        const access = res.accessToken
        if (!access) return false

        this.accessToken = access
        localStorage.setItem('accessToken', access)

        return await this.loadMe()
      } catch {
        return false
      }
    },

    async loadMe() {
      if (!this.accessToken) {
        this.user = null
        this.ready = true
        return true
      }

      try {
        const res = await authApi.me()

        // ADMIN всегда активен
        if (res.role === 'ADMIN') {
          this.user = res
          this.ready = true
          return true
        }

        // Единственный источник истины — User.isActive
        const isActive = res.isActive === true

        if (!isActive) {
          markLoggedOut()
          localStorage.removeItem('accessToken')
          this.accessToken = null
          this.user = null
          window.location.href = '/blocked'
          return false
        }

        this.user = res
      } catch {
        this.user = null
      }

      this.ready = true
      return true
    },




    async logout() {
      try {
        await authApi.logout()
      } catch {}

      markLoggedOut()
      localStorage.removeItem('accessToken')
      this.accessToken = null
      this.user = null
      window.location.href = '/'
    },
  },
})
