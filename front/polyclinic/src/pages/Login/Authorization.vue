<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <form
      @submit.prevent="submit"
      class="w-full max-w-md bg-white p-6 rounded-xl shadow-md border border-gray-200"
    >
      <h2 class="text-2xl font-semibold text-gray-800 mb-4">Вход</h2>

      <!-- Email -->
      <div class="mb-4">
        <input
          v-model.trim="email"
          type="email"
          placeholder="Email"
          :disabled="loading"
          autocomplete="username"
          class="w-full px-4 py-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
        />
        <p v-if="submitted && !email" class="text-red-600 text-sm mt-1">Email обязателен</p>
      </div>

      <!-- Password -->
      <div class="mb-4">
        <div class="flex items-center gap-2">
          <input
            v-model="password"
            :type="show ? 'text' : 'password'"
            placeholder="Пароль"
            :disabled="loading"
            autocomplete="current-password"
            class="w-full px-4 py-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            @click="show = !show"
            class="px-3 py-2 border rounded-lg text-sm bg-white hover:bg-gray-100"
          >
            {{ show ? 'Скрыть' : 'Показать' }}
          </button>
        </div>
        <p v-if="submitted && !password" class="text-red-600 text-sm mt-1">Пароль обязателен</p>
      </div>

      <!-- Buttons -->
      <div class="flex items-center gap-3 mt-4">
        <button
          type="submit"
          :disabled="loading"
          class="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60"
        >
          <span
            v-if="loading"
            class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
          ></span>
          {{ loading ? 'Вхожу...' : 'Войти' }}
        </button>

        <router-link
          to="/register"
          class="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold text-center hover:bg-red-700"
        >
          Регистрация
        </router-link>
      </div>

      <!-- Global error -->
      <p v-if="error" class="mt-4 text-red-600 font-medium text-center">
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
