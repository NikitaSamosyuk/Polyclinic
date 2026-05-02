<script setup lang="ts">
import { ref } from 'vue'
import { usersApi } from '@/api/users'

const emit = defineEmits(['close', 'created'])

const form = ref({
  username: '',
  email: '',
  password: '',
})

const error = ref<string | null>(null)
const loading = ref(false)

async function createUser() {
  loading.value = true
  error.value = null

  try {
    const res = await usersApi.createDoctorUser(form.value)

    // ВАЖНО: backend НЕ возвращает res.id
    const userId = res?.id || res?.userId || res?.user?.id || res?.data?.id

    if (!userId) {
      throw new Error('Backend did not return user ID')
    }

    emit('created', userId)
    emit('close')
  } catch (e: any) {
    error.value = e?.response?.data?.message || e.message || 'Ошибка создания пользователя'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div
    class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
    @click.self="emit('close')"
  >
    <div class="bg-white w-full max-w-lg rounded-xl shadow-xl p-8 space-y-6">
      <h2 class="text-2xl font-bold text-teal-700">Создание пользователя врача</h2>

      <div class="space-y-4">
        <input
          v-model="form.username"
          class="w-full px-4 py-2 border border-teal-500 rounded-lg"
          placeholder="Логин"
        />

        <input
          v-model="form.email"
          type="email"
          class="w-full px-4 py-2 border border-teal-500 rounded-lg"
          placeholder="Email"
        />

        <input
          v-model="form.password"
          type="password"
          class="w-full px-4 py-2 border border-teal-500 rounded-lg"
          placeholder="Пароль"
        />

        <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
      </div>

      <div class="flex justify-end gap-3">
        <button class="px-4 py-2 bg-gray-300 rounded-lg" @click="emit('close')">Отмена</button>

        <button
          class="px-4 py-2 bg-teal-600 text-white rounded-lg"
          @click="createUser"
          :disabled="loading"
        >
          {{ loading ? 'Создание...' : 'Создать' }}
        </button>
      </div>
    </div>
  </div>
</template>
