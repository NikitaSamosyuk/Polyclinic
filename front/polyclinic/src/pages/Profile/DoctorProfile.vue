<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { doctorsApi } from '@/api/doctors'
import { appointmentsApi } from '@/api/appointments'
import { useAuthStore } from '@/store/auth.store'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)
const doctor = ref<any | null>(null)
const appointments = ref<any[]>([])

async function loadDoctor() {
  loading.value = true
  error.value = null
  try {
    const res = await doctorsApi.getByUserId(auth.user?.id)
    doctor.value = res?.data || res
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Ошибка загрузки профиля'
  } finally {
    loading.value = false
  }
}

async function loadAppointments() {
  try {
    const res = await appointmentsApi.getByDoctorId(doctor.value?.id)
    appointments.value = res?.data || res
  } catch (e) {
    console.error(e)
  }
}

onMounted(async () => {
  if (!auth.user) {
    router.replace({ name: 'Authorization' })
    return
  }
  await loadDoctor()
  if (doctor.value) await loadAppointments()
})
</script>

<template>
  <div class="bg-white shadow-md rounded-xl p-6">
    <h2 class="text-2xl font-semibold mb-4">Профиль врача</h2>

    <div v-if="loading" class="text-gray-500">Загрузка...</div>
    <div v-else-if="error" class="text-red-600 font-semibold">{{ error }}</div>
    <div v-else-if="!doctor" class="text-gray-500">Профиль врача не найден</div>

    <div v-else>
      <div class="mb-6">
        <div class="text-xl font-semibold">{{ doctor.fullName || doctor.username }}</div>
        <div class="text-gray-500">{{ doctor.specialization || 'Специализация не указана' }}</div>
      </div>

      <h3 class="text-xl font-semibold mb-3">Записи</h3>

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
        </li>
      </ul>
    </div>
  </div>
</template>
