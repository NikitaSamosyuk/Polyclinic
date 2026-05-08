<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <form
      @submit.prevent="submit"
      class="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-teal-200 space-y-6"
    >
      <!-- Заголовок -->
      <h1 class="text-3xl font-bold text-teal-800 text-center">Регистрация</h1>

      <!-- Имя -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Имя</label>
        <input
          v-model.trim="username"
          placeholder="Введите имя"
          class="w-full px-4 py-3 border border-teal-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
        />
        <p v-if="submitted && !username" class="text-red-600 text-sm mt-1">Имя обязательно</p>
      </div>

      <!-- Email -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          v-model.trim="email"
          type="email"
          placeholder="Введите email"
          class="w-full px-4 py-3 border border-teal-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
        />
        <p v-if="submitted && !email" class="text-red-600 text-sm mt-1">Email обязателен</p>
      </div>

      <!-- Пароль -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
        <input
          v-model.trim="password"
          type="password"
          placeholder="Введите пароль"
          class="w-full px-4 py-3 border border-teal-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
        />
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
          {{ loading ? 'Создаю...' : 'Зарегистрироваться' }}
        </button>

        <!-- 🔥 Исправлено: правильный путь -->
        <router-link
          to="/auth"
          class="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold text-center hover:bg-gray-300 transition"
        >
          Назад
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

const username = ref('')
const email = ref('')
const password = ref('')
const error = ref<string | null>(null)
const submitted = ref(false)
const loading = ref(false)

const router = useRouter()
const auth = useAuthStore()

async function submit() {
  submitted.value = true
  error.value = null

  if (!username.value || !email.value || !password.value) return

  loading.value = true
  try {
    await auth.register(username.value, email.value, password.value)
    await router.push({ name: 'Profile' })
  } catch (e: any) {
    if (e?.response?.status === 400) {
      error.value = 'Пользователь с таким email уже существует'
    } else {
      error.value = e?.message || 'Ошибка регистрации'
    }
  } finally {
    loading.value = false
  }
}
</script>
