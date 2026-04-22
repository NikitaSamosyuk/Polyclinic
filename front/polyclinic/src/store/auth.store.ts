// src/store/auth.store.ts
import { defineStore } from 'pinia'
import { authApi } from '@/api/auth'
import { markLoggedOut } from '@/api/axios'

export interface User {
  id: number
  email: string
  username: string
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN'
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('accessToken') || null,
    user: null as User | null,
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
    },

    async loadMe() {
      if (!this.accessToken) {
        this.user = null
        this.ready = true
        return
      }
      try {
        const res = await authApi.me()
        this.user = res
      } catch {
        this.user = null
      }
      this.ready = true
    },

    async logout() {
      // 🔥 1. СНАЧАЛА говорим backend'у «разлогинь»
      try {
        await authApi.logout() // тут ещё есть Authorization, backend знает user.sub и чистит refresh в Redis
      } catch {
        // даже если тут 401/500 — всё равно выходим локально
      }

      // 🔥 2. Больше НИКОГДА не рефрешим токен в этом сеансе
      markLoggedOut()

      // 🔥 3. Чистим токен и юзера на фронте
      localStorage.removeItem('accessToken')
      this.accessToken = null
      this.user = null

      // 🔥 4. Жёсткий redirect (обнуляет всё состояние)
      window.location.href = '/'
    },
  },
})
