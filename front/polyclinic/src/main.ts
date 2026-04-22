// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/store/auth.store'

// 🔥 твои стили
import './styles/tailwind.css'
import './style.css'

async function init() {
  const app = createApp(App)
  const pinia = createPinia()
  app.use(pinia)

  const auth = useAuthStore()

  // 🔥 1. Берём токен из localStorage
  const token = localStorage.getItem('accessToken')

  if (token) {
    // 🔥 2. Если токен есть — пробуем загрузить пользователя
    await auth.loadMe()

    // 🔥 3. Если токен есть, но user НЕ загрузился → токен недействителен
    if (!auth.user) {
      localStorage.removeItem('accessToken')
      auth.accessToken = null
    }
  } else {
    // 🔥 4. Если токена нет — user = null (ВАЖНО!)
    auth.user = null
    auth.accessToken = null
  }

  // 🔥 5. Только теперь подключаем router
  app.use(router)

  // 🔥 6. И только теперь монтируем приложение
  app.mount('#app')
}

init()
