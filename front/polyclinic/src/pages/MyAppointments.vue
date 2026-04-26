<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth.store'
import { getMyAppointments } from '@/api/appointments'

import AppointmentCard from '@/components/AppointmentCard.vue'
import DoctorAppointmentModal from '@/pages/appointment/DoctorAppointmentModal.vue'
import PatientAppointmentModal from '@/pages/appointment/PatientAppointmentModal.vue'
import AppointmentCreateWizard from '@/pages/appointment/AppointmentCreateWizard.vue'
import DoctorModal from '@/components/DoctorModal.vue'

const auth = useAuthStore()

const loading = ref(true)
const appointments = ref<any[]>([])
const search = ref('')
const sort = ref('date')

const showDoctor = ref(false)
const showPatient = ref(false)
const showCreate = ref(false)
const showDoctorProfile = ref(false)

const selected = ref<any>(null)
const selectedDoctor = ref<any>(null)

async function load() {
  loading.value = true
  try {
    const res = await getMyAppointments()
    appointments.value = Array.isArray(res) ? res : []
  } catch (e) {
    console.error('Ошибка загрузки записей', e)
    appointments.value = []
  }
  loading.value = false
}

function open(appt: any) {
  selected.value = appt

  if (auth.user.role === 'DOCTOR') showDoctor.value = true
  else showPatient.value = true
}

function openDoctorModal(doctor: any) {
  selectedDoctor.value = doctor
  showDoctorProfile.value = true
}

const filtered = computed(() => {
  const q = search.value.toLowerCase()

  let list = appointments.value.filter((a) => {
    const doctorName = `${a.doctor?.lastName ?? ''} ${a.doctor?.firstName ?? ''} ${a.doctor?.middleName ?? ''}`
    const patientName = `${a.patient?.lastName ?? ''} ${a.patient?.firstName ?? ''} ${a.patient?.middleName ?? ''}`

    return `${doctorName} ${patientName}`.toLowerCase().includes(q)
  })

  // Сортировка только по дате и времени начала
  if (sort.value === 'date') {
    list = list.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  }

  return list
})

onMounted(load)
</script>

<template>
  <div class="max-w-6xl mx-auto p-6">
    <!-- Заголовок + кнопка -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Мои записи</h1>

      <!-- Кнопка записи — только пациент -->
      <button
        v-if="auth.user.role === 'PATIENT'"
        class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        @click="showCreate = true"
      >
        + Записаться
      </button>
    </div>

    <!-- Поиск + сортировка -->
    <div class="flex gap-4 mb-6">
      <input v-model="search" class="px-3 py-2 border rounded w-full" placeholder="Поиск по ФИО" />

      <select v-model="sort" class="px-3 py-2 border rounded">
        <option value="date">По дате</option>
      </select>
    </div>

    <!-- Список -->
    <div v-if="loading">Загрузка...</div>

    <div v-else>
      <div v-if="filtered.length === 0" class="text-gray-500 text-lg">У вас пока нет записей</div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AppointmentCard
          v-for="a in filtered"
          :key="a.id"
          :appointment="a"
          :is-admin="false"
          :is-doctor="auth.user.role === 'DOCTOR'"
          :is-patient="auth.user.role === 'PATIENT'"
          @open="open"
          @open-doctor="openDoctorModal"
        />
      </div>
    </div>

    <!-- Модалки -->
    <DoctorAppointmentModal v-if="showDoctor" v-model="showDoctor" :appointment="selected" />

    <PatientAppointmentModal v-if="showPatient" v-model="showPatient" :appointment="selected" />

    <!-- Модалка врача -->
    <DoctorModal
      v-if="showDoctorProfile"
      :doctor-id="selectedDoctor?.id"
      :show="showDoctorProfile"
      @close="showDoctorProfile = false"
    />

    <!-- Wizard записи -->
    <AppointmentCreateWizard v-if="showCreate" v-model="showCreate" @saved="load" />
  </div>
</template>
