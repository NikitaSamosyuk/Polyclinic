<script setup lang="ts">
import { useRouter } from 'vue-router'

const props = defineProps<{
  appointment: any
}>()

const router = useRouter()

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

function openPatient() {
  const id = props.appointment.patient?.userId ?? props.appointment.patientId
  if (!id) return
  router.push({ name: 'PatientCard', params: { userId: String(id) } })
}
</script>

<template>
  <div class="appointment-card">
    <div class="time">
      <div><strong>Дата:</strong> {{ formatDateTime(appointment.appointmentDate) }}</div>
      <div><strong>Время:</strong> {{ formatDateTime(appointment.startTime) }}</div>
    </div>

    <div class="patient">
      <strong>Пациент:</strong>
      <span v-if="appointment.patient">
        {{ appointment.patient.lastName }} {{ appointment.patient.firstName }}
      </span>
      <span v-else>—</span>
    </div>

    <button v-if="appointment.patient" class="open-btn" @click="openPatient">
      Открыть карточку пациента
    </button>
  </div>
</template>

<style scoped>
.appointment-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 12px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.time {
  font-size: 14px;
}

.patient {
  font-size: 14px;
}

.open-btn {
  margin-top: 6px;
  padding: 6px 10px;
  background: #2b6cb0;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.open-btn:hover {
  background: #1e4f80;
}
</style>
