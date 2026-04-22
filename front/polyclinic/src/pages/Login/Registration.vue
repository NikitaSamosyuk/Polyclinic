<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <form
      @submit.prevent="submit"
      class="w-full max-w-md bg-white p-6 rounded-xl shadow-md border border-gray-200"
    >
      <h1 class="text-2xl font-semibold text-gray-800 mb-4">Регистрация</h1>

      <input
        v-model="username"
        placeholder="Имя"
        class="w-full px-4 py-2 mb-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
      />

      <input
        v-model="email"
        placeholder="Email"
        type="email"
        class="w-full px-4 py-2 mb-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
      />

      <input
        v-model="password"
        type="password"
        placeholder="Пароль"
        class="w-full px-4 py-2 mb-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
      />

      <button
        type="submit"
        class="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
      >
        Зарегистрироваться
      </button>

      <p v-if="error" class="mt-4 text-red-600 font-medium text-center">
        {{ error }}
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth.store'

const username = ref('')
const email = ref('')
const password = ref('')
const error = ref<string | null>(null)

const router = useRouter()
const auth = useAuthStore()

async function submit() {
  try {
    await auth.register(username.value, email.value, password.value)
    await router.push({ name: 'Profile' })
  } catch (e: any) {
    if (e?.response?.status === 400) {
      error.value = 'Пользователь с таким email уже существует'
    } else {
      error.value = e?.message || 'Ошибка регистрации'
    }
  }
}
</script>
