<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <form
      @submit.prevent="submit"
      class="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-teal-200 space-y-6"
    >
      <!-- Заголовок -->
      <h2 class="text-3xl font-bold text-teal-800 text-center">Вход в систему</h2>

      <!-- Email -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          v-model.trim="email"
          type="email"
          placeholder="Введите email"
          :disabled="loading"
          autocomplete="username"
          class="w-full px-4 py-3 border border-teal-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
        />
        <p v-if="submitted && !email" class="text-red-600 text-sm mt-1">Email обязателен</p>
      </div>

      <!-- Password -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Пароль</label>

        <div class="flex items-center gap-2">
          <input
            v-model="password"
            :type="show ? 'text' : 'password'"
            placeholder="Введите пароль"
            :disabled="loading"
            autocomplete="current-password"
            class="w-full px-4 py-3 border border-teal-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />

          <button
            type="button"
            @click="show = !show"
            class="px-3 py-2 border border-teal-300 rounded-lg text-sm bg-white hover:bg-teal-50 transition"
          >
            {{ show ? 'Скрыть' : 'Показать' }}
          </button>
        </div>

        <p v-if="submitted && !password" class="text-red-600 text-sm mt-1">Пароль обязателен</p>
      </div>

      <!-- Кнопки -->
      <div class="flex items-center gap-4 pt-2">
        <button
          type="submit"
          :disabled="loading"
          class="flex-1 bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition disabled:opacity-60"
        >
          <span
            v-if="loading"
            class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
          ></span>
          {{ loading ? 'Вхожу...' : 'Войти' }}
        </button>

        <router-link
          to="/register"
          class="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold text-center hover:bg-gray-300 transition"
        >
          Регистрация
        </router-link>
      </div>

      <!-- Ошибка -->
      <p v-if="error" class="mt-2 text-red-600 font-medium text-center">
        {{ error }}
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth.store'

const email = ref('')
const password = ref('')
const show = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const submitted = ref(false)

const auth = useAuthStore()
const router = useRouter()

async function submit() {
  submitted.value = true
  error.value = null

  if (!email.value || !password.value) return

  loading.value = true
  try {
    const ok = await auth.login(email.value, password.value)

    if (!ok) {
      error.value = 'Неправильная почта или пароль'
      return
    }

    await auth.loadMe()

    if (auth.user) {
      router.push({ name: 'Profile' })
    } else {
      error.value = 'Ошибка загрузки профиля'
    }
  } catch {
    error.value = 'Ошибка входа'
  } finally {
    loading.value = false
  }
}
</script>
