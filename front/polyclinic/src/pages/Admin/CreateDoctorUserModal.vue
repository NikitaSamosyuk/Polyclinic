<script setup lang="ts">
import { ref } from 'vue'
import { usersApi } from '@/api/users'

const emit = defineEmits(['close', 'created'])

const form = ref({
  email: '',
  username: '',
  password: '',
})

const errors = ref<Record<string, string>>({})
const serverError = ref('')

async function submit() {
  errors.value = {}
  serverError.value = ''

  if (!form.value.email) errors.value.email = 'Email обязателен'
  if (!form.value.username) errors.value.username = 'Логин обязателен'
  if (!form.value.password) errors.value.password = 'Пароль обязателен'

  if (Object.keys(errors.value).length > 0) return

  try {
    const user = await usersApi.createDoctorUser(form.value)
    emit('created', user.id)
  } catch (e: any) {
    serverError.value = e?.response?.data?.message || 'Ошибка создания пользователя'
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black/40 flex justify-center items-center">
    <div class="bg-white p-6 rounded-xl w-[420px] shadow-lg">
      <h2 class="text-xl font-semibold mb-4">Создание пользователя врача</h2>

      <p v-if="serverError" class="text-red-600 mb-3 text-sm">{{ serverError }}</p>

      <div class="space-y-3">
        <input
          v-model="form.email"
          class="w-full px-3 py-2 border rounded-lg"
          placeholder="Email"
        />
        <input
          v-model="form.username"
          class="w-full px-3 py-2 border rounded-lg"
          placeholder="Логин"
        />
        <input
          v-model="form.password"
          type="password"
          class="w-full px-3 py-2 border rounded-lg"
          placeholder="Пароль"
        />

        <button
          class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
          @click="submit"
        >
          Далее
        </button>

        <button
          class="w-full bg-gray-300 py-2 rounded-lg hover:bg-gray-400"
          @click="$emit('close')"
        >
          Отмена
        </button>
      </div>
    </div>
  </div>
</template>
