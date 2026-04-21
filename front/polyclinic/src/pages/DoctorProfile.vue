<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { doctorsApi } from '../api/doctors'
import { appointmentsApi } from '../api/appointments'
import { useAuthStore } from '../store/auth.store'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const doctor = ref<any | null>(null)
const appointments = ref<any[]>([])

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
  if (!auth.user) {
    await auth.loadMe()
  }
  if (!auth.user) return

  try {
    const d = await doctorsApi.getByUserId(auth.user.id)
    doctor.value = d

    const a = await appointmentsApi.getMyAppointments()
    appointments.value = Array.isArray(a) ? a : []
  } catch (err) {
    console.error('Error loading doctor or appointments', err)
    doctor.value = null
    appointments.value = []
  }
})

function openPatientCard(a: any) {
  const pid = a.patient?.id ?? a.patientId
  if (!pid) return
  router.push({ name: 'PatientCard', params: { id: String(pid) } })
}
</script>

<template>
  <div>
    <h2>Профиль врача</h2>

    <div v-if="doctor">
      <p>
        <b>ФИО:</b> {{ doctor.lastName || '—' }} {{ doctor.firstName || '' }}
        {{ doctor.middleName || '' }}
      </p>
      <p><b>Специализация:</b> {{ doctor.specialization || '—' }}</p>

      <p v-if="doctor.cabinet"><b>Кабинет:</b> {{ doctor.cabinet.number || '—' }}</p>
      <p v-else><b>Кабинет:</b> не назначен</p>
    </div>

    <h3>Мои записи</h3>

    <ul v-if="appointments.length">
      <li v-for="a in appointments" :key="a.id" class="appointment-item">
        <span class="appt-time">{{ formatDateTime(a.startTime || a.appointmentDate) }}</span>
        —
        <router-link
          :to="{
            name: 'PatientCard',
            params: { id: String(a.patient?.id ?? a.patientId) },
          }"
          class="patient-link"
          v-if="a.patient || a.patientId"
        >
          {{ a.patient?.lastName || a.patientName || 'Пациент' }}
          <span v-if="a.patient?.firstName"> {{ a.patient.firstName }}</span>
        </router-link>

        <span v-else class="patient-missing">—</span>

        <!-- Альтернатива: кнопка открытия карточки -->
        <button v-if="a.patient || a.patientId" @click="openPatientCard(a)" class="open-card-btn">
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
.patient-link {
  color: #2b6cb0;
  text-decoration: underline;
}
.open-card-btn {
  margin-left: 8px;
  padding: 4px 8px;
  font-size: 12px;
}
.patient-missing {
  color: #888;
}
</style>
