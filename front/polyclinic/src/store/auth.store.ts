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
    },
    ready: false,
  }),

  actions: {
    // --- LOGIN ---
    async login(email: string, password: string) {
      try {
        const res = await authApi.login(email, password)

        const access = res.accessToken
        if (!access) return false

        this.accessToken = access
        localStorage.setItem('accessToken', access)

        await this.loadMe()
        return true
      } catch {
        return false
      }
    },

    // --- REGISTER ---
    async register(username: string, email: string, password: string) {
      try {
        const res = await authApi.register(username, email, password)

        const access = res.accessToken
        if (!access) return false

        this.accessToken = access
        localStorage.setItem('accessToken', access)

        await this.loadMe()
        return true
      } catch {
        return false
      }
    },

    // --- LOAD USER ---
    async loadMe() {
      // Нет токена → не авторизован
      if (!this.accessToken) {
        this.user = null
        this.ready = true
        return true
      }

      try {
        const res = await authApi.me()

        // backend возвращает user напрямую
        this.user = res
      } catch {
        // токен протух → выходим
        this.user = null
      }

      this.ready = true
      return true
    },

    // --- LOGOUT ---
    async logout() {
      try {
        await authApi.logout()
      } catch {
        // сервер может быть недоступен — игнорируем
      }

      // запрещаем axios делать refresh
      markLoggedOut()

      // чистим токен
      localStorage.removeItem('accessToken')
      this.accessToken = null
      this.user = null

      // полный сброс состояния
      window.location.href = '/'
    },
  },
})
