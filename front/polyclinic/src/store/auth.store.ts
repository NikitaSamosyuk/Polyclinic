// src/store/auth.store.ts
import { defineStore } from 'pinia'
import { authApi } from '@/api/auth'
import { markLoggedOut } from '@/api/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('accessToken'),
    user: null,
    ready: false,
  }),

  actions: {
    async login(email: string, password: string) {
      try {
        const res = await authApi.login(email, password)
        const access = res.accessToken

        this.accessToken = access
        localStorage.setItem('accessToken', access)

        await this.loadMe()
        return true
      } catch {
        return false
      }
    },

    async register(username: string, email: string, password: string) {
      const res = await authApi.register(username, email, password)
      const access = res.accessToken

      this.accessToken = access
      localStorage.setItem('accessToken', access)

      await this.loadMe()
      return true
    },

    async loadMe() {
      // Нет токена → пользователь не авторизован
      if (!this.accessToken) {
        this.user = null
        this.ready = true
        return true
      }

      try {
        const res = await authApi.me()
        this.user = res
      } catch {
        // 401, токен протух, пользователь не авторизован
        this.user = null
      }

      // ВАЖНО: ВСЕГДА завершаем loadMe()
      this.ready = true
      return true
    },

    async logout() {
      try {
        await authApi.logout()
      } catch {
        // сервер может быть недоступен — игнорируем
      }

      markLoggedOut()

      localStorage.removeItem('accessToken')
      this.accessToken = null
      this.user = null

      window.location.href = '/'
    },
  },
})
