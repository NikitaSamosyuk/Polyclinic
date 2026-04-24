import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/store/auth.store'

import './styles/tailwind.css'
import './style.css'

async function init() {
  const app = createApp(App)
  const pinia = createPinia()
  app.use(pinia)

  const auth = useAuthStore()
  const token = localStorage.getItem('accessToken')

  if (token) {
    try {
      await auth.loadMe()
    } catch {
      localStorage.removeItem('accessToken')
      auth.user = null
      auth.accessToken = null
    }
  } else {
    auth.user = null
    auth.accessToken = null
  }

  auth.ready = true

  app.use(router)
  app.mount('#app')
}

init()
