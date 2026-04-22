<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { patientsApi } from '@/api/patients'
import { useAuthStore } from '@/store/auth.store'

const router = useRouter()
const auth = useAuthStore()

const patient = ref<any | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  loading.value = true
  try {
    if (!auth.user) {
      error.value = 'Пользователь не авторизован'
      return
    }

    const res = await patientsApi.getByUserId(auth.user.id)
    patient.value = res?.data || res || null

    if (!patient.value) {
      error.value = 'Профиль пациента не найден'
    }
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Ошибка загрузки'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="bg-white shadow-md rounded-xl p-6">
    <h2 class="text-2xl font-semibold mb-4">Профиль пациента</h2>

    <div v-if="loading" class="text-gray-500">Загрузка...</div>

    <div v-else-if="error" class="text-red-600 font-semibold">
      {{ error }}
    </div>

    <div v-else>
      <div class="text-xl font-semibold">{{ patient.fullName || patient.username }}</div>
      <div class="text-gray-500">
        {{ patient.age ? patient.age + ' лет' : 'Возраст не указан' }}
      </div>
      <div class="text-gray-500">{{ patient.phone || 'Телефон не указан' }}</div>
    </div>
  </div>
</template>
