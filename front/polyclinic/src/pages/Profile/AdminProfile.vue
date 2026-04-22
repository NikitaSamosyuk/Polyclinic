<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { appointmentsApi } from '@/api/appointments'
import { useAuthStore } from '@/store/auth.store'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)
const appointments = ref<any[]>([])

async function loadAppointments() {
  loading.value = true
  error.value = null
  try {
    const res = await appointmentsApi.getAll()
    appointments.value = res?.data || res || []
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Ошибка загрузки'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (!auth.user) {
    router.replace({ name: 'Authorization' })
    return
  }
  await loadAppointments()
})
</script>

<template>
  <div class="bg-white shadow-md rounded-xl p-6">
    <h2 class="text-2xl font-semibold mb-4">Панель администратора</h2>

    <div v-if="loading" class="text-gray-500">Загрузка...</div>
    <div v-else-if="error" class="text-red-600 font-semibold">{{ error }}</div>

    <div v-else>
      <h3 class="text-xl font-semibold mb-3">Все записи</h3>

      <div v-if="appointments.length === 0" class="text-gray-500">Нет записей</div>

      <ul v-else class="space-y-3">
        <li
          v-for="a in appointments"
          :key="a.id"
          class="p-4 border rounded-lg bg-gray-50 flex justify-between"
        >
          <div>
            <div class="font-semibold">
              {{ a.patientName || a.patient?.username || 'Пациент' }}
            </div>
            <div class="text-gray-500 text-sm">{{ a.date || a.scheduledAt }}</div>
          </div>
          <div class="text-gray-500 text-sm">{{ a.status || '—' }}</div>
        </li>
      </ul>
    </div>
  </div>
</template>
