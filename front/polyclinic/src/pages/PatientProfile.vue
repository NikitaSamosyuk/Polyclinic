<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { patientsApi } from '../api/patients'
import { appointmentsApi } from '../api/appointments'

const props = defineProps<{ user: any }>()

const patient = ref(null)
const appointments = ref([])

onMounted(async () => {
  patient.value = await patientsApi.getByUserId(props.user.id)
  appointments.value = await appointmentsApi.getMyAppointments()
})
</script>

<template>
  <div>
    <h2>Профиль пациента</h2>

    <div v-if="patient">
      <p><b>ФИО:</b> {{ patient.lastName }} {{ patient.firstName }} {{ patient.middleName }}</p>
      <p><b>Дата рождения:</b> {{ patient.birthDate }}</p>
      <p><b>Телефон:</b> {{ patient.phone }}</p>
      <p><b>Адрес:</b> {{ patient.address }}</p>

      <p v-if="patient.primaryTherapist">
        <b>Участковый врач:</b>
        {{ patient.primaryTherapist.lastName }} {{ patient.primaryTherapist.firstName }}
      </p>
      <p v-else><b>Участковый врач:</b> не назначен</p>
    </div>

    <h3>Мои записи</h3>
    <ul>
      <li v-for="a in appointments" :key="a.id">
        {{ a.appointmentDate }} — {{ a.doctor?.lastName || '—' }}
      </li>
    </ul>
  </div>
</template>
