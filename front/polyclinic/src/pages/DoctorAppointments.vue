<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { appointmentsApi } from '../api/appointments'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const list = ref<any[]>([])

function formatDateTime(value: string | Date | null) {
  if (!value) return '—'
  try {
    const d = new Date(value)
    return d.toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return String(value)
  }
}

onMounted(async () => {
  const id = Number(route.params.id)
  if (!id) return
  try {
    const res = await appointmentsApi.getDoctorAppointments(id)
    list.value = Array.isArray(res) ? res : []
  } catch (err) {
    console.error('Error loading doctor appointments', err)
    list.value = []
  }
})

function openPatient(id: number | undefined) {
  if (!id) return
  router.push({ name: 'PatientCard', params: { id: String(id) } })
}
</script>

<template>
  <div>
    <h2>Записи врача</h2>

    <ul v-if="list.length">
      <li v-for="a in list" :key="a.id" class="appointment-item">
        <span>{{ formatDateTime(a.startTime || a.appointmentDate) }}</span>
        —
        <router-link
          v-if="a.patient || a.patientId"
          :to="{ name: 'PatientCard', params: { id: String(a.patient?.id ?? a.patientId) } }"
        >
          {{ a.patient?.lastName || a.patientName || 'Пациент' }}
          <span v-if="a.patient?.firstName"> {{ a.patient.firstName }}</span>
        </router-link>

        <span v-else>—</span>

        <button v-if="a.patient || a.patientId" @click="openPatient(a.patient?.id ?? a.patientId)">
          Открыть карточку
        </button>
      </li>
    </ul>

    <p v-else>Нет записей</p>
  </div>
</template>

<style scoped>
.appointment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
</style>
