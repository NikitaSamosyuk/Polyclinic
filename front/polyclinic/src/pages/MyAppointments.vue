<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth.store'
import { appointmentsApi } from '@/api/appointments'

import AppointmentCard from '@/components/AppointmentCard.vue'
import DoctorAppointmentModal from '@/pages/Appointment/DoctorAppointmentModal.vue'
import PatientAppointmentModal from '@/pages/Appointment/PatientAppointmentModal.vue'
import AppointmentCreateWizard from '@/pages/Appointment/AppointmentCreateWizard.vue'
import AppointmentPatientCancel from '@/pages/Appointment/AppointmentPatientCancel.vue'
import DoctorModal from '@/components/DoctorModal.vue'
import CreateVisitModal from '@/pages/visit/CreateVisitModal.vue'

const auth = useAuthStore()

const loading = ref(true)
const appointments = ref<any[]>([])
const error = ref<string | null>(null)

const searchInput = ref('')
const searchQuery = ref('')

// Фильтры
const filterYear = ref('')
const filterMonth = ref('')
const filterDay = ref('')
const filterTime = ref('')

const currentPage = ref(1)
const perPage = 10

// Модалки
const showDoctor = ref(false)
const showPatient = ref(false)
const showCreate = ref(false)
const showDoctorProfile = ref(false)
const showCancel = ref(false)
const showCreateVisit = ref(false)

const selected = ref<any>(null)
const selectedDoctor = ref<any>(null)
const cancelTarget = ref<any>(null)
const selectedAppointmentForVisit = ref<any>(null)

async function load() {
  loading.value = true
  try {
    const res = await appointmentsApi.getMy()
    appointments.value = Array.isArray(res) ? res : []
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Ошибка загрузки записей'
    appointments.value = []
  } finally {
    loading.value = false
  }
}

function applySearch() {
  searchQuery.value = searchInput.value.trim().toLowerCase()
  currentPage.value = 1
}

function open(appt: any) {
  selected.value = appt
  const role = auth.user?.role
  if (role === 'DOCTOR') showDoctor.value = true
  else showPatient.value = true
}

function openDoctorModal(doctor: any) {
  selectedDoctor.value = doctor
  showDoctorProfile.value = true
}

function openCancel(appt: any) {
  cancelTarget.value = appt
  showCancel.value = true
}

function openCreateVisit(appt: any) {
  selectedAppointmentForVisit.value = appt
  showCreateVisit.value = true
}

function formatDate(d: string) {
  return new Date(d).toISOString().slice(0, 10)
}

function formatTime(t: string) {
  return t.slice(11, 16)
}

const filtered = computed(() => {
  const q = searchQuery.value

  let list = appointments.value.filter((a) => {
    const doctor =
      `${a.doctor.lastName} ${a.doctor.firstName} ${a.doctor.middleName || ''}`.toLowerCase()
    const patient =
      `${a.patient.lastName} ${a.patient.firstName} ${a.patient.middleName || ''}`.toLowerCase()

    const date = formatDate(a.appointmentDate)
    const time = formatTime(a.startTime)

    const matchSearch = doctor.includes(q) || patient.includes(q)
    const matchYear = filterYear.value ? date.startsWith(filterYear.value) : true
    const matchMonth = filterMonth.value ? date.slice(5, 7) === filterMonth.value : true
    const matchDay = filterDay.value ? date.slice(8, 10) === filterDay.value : true
    const matchTime = filterTime.value ? time === filterTime.value : true

    return matchSearch && matchYear && matchMonth && matchDay && matchTime
  })

  list = list.sort((a, b) => {
    const da = new Date(a.appointmentDate).getTime()
    const db = new Date(b.appointmentDate).getTime()

    if (da !== db) return da - db

    const ta = new Date(a.startTime).getTime()
    const tb = new Date(b.startTime).getTime()

    return ta - tb
  })

  return list
})

const paginated = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filtered.value.slice(start, start + perPage)
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage)))

const years = computed(() => {
  const set = new Set(appointments.value.map((a) => formatDate(a.appointmentDate).slice(0, 4)))
  return [...set]
})

const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']

const days = computed(() => {
  let list = appointments.value

  if (filterYear.value) {
    list = list.filter((a) => formatDate(a.appointmentDate).startsWith(filterYear.value))
  }

  if (filterMonth.value) {
    list = list.filter((a) => formatDate(a.appointmentDate).slice(5, 7) === filterMonth.value)
  }

  const set = new Set(list.map((a) => formatDate(a.appointmentDate).slice(8, 10)))
  return [...set].sort()
})

const times = computed(() => {
  const set = new Set(appointments.value.map((a) => formatTime(a.startTime)))
  return [...set].sort()
})

async function cancelAppointment(appt: any) {
  try {
    await appointmentsApi.deleteMy(appt.id)
    showCancel.value = false
    await load()
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Ошибка отмены записи')
  }
}

onMounted(load)
</script>

<template>
  <!-- 🔥 ВЕСЬ КОНТЕНТ СТРАНИЦЫ -->
  <div class="max-w-7xl mx-auto p-8 flex flex-col gap-10">
    <div class="flex justify-between items-center">
      <h1 class="text-4xl font-extrabold text-teal-800 tracking-tight">Мои записи</h1>

      <button
        v-if="auth.user?.role === 'PATIENT'"
        class="px-5 py-3 bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700 transition"
        @click="showCreate = true"
      >
        + Записаться
      </button>
    </div>

    <!-- Панель поиска -->
    <div class="bg-white border border-teal-400 rounded-xl shadow p-6 flex flex-col gap-6">
      <div class="relative">
        <input
          v-model="searchInput"
          @keyup.enter="applySearch"
          class="w-full px-4 py-3 border border-teal-400 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
          placeholder="Поиск по врачу или пациенту"
        />

        <button
          @click="applySearch"
          class="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 opacity-70 hover:opacity-100 transition"
        >
          <img src="@/assets/look.png" alt="search" class="w-6 h-6 object-contain" />
        </button>
      </div>

      <!-- Фильтры -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <select
          v-model="filterYear"
          @change="applySearch"
          class="px-4 py-3 border border-teal-400 rounded-lg bg-white shadow-sm"
        >
          <option value="">Год</option>
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>

        <select
          v-model="filterMonth"
          @change="applySearch"
          class="px-4 py-3 border border-teal-400 rounded-lg bg-white shadow-sm"
        >
          <option value="">Месяц</option>
          <option v-for="m in months" :key="m" :value="m">{{ m }}</option>
        </select>

        <select
          v-model="filterDay"
          @change="applySearch"
          class="px-4 py-3 border border-teal-400 rounded-lg bg-white shadow-sm"
        >
          <option value="">День</option>
          <option v-for="d in days" :key="d" :value="d">{{ d }}</option>
        </select>

        <select
          v-model="filterTime"
          @change="applySearch"
          class="px-4 py-3 border border-teal-400 rounded-lg bg-white shadow-sm"
        >
          <option value="">Время</option>
          <option v-for="t in times" :key="t" :value="t">{{ t }}</option>
        </select>
      </div>
    </div>

    <!-- Состояния -->
    <div v-if="loading" class="text-gray-600 text-lg text-center py-10">Загрузка...</div>

    <div v-else-if="error" class="text-red-600 text-lg text-center py-10">
      {{ error }}
    </div>

    <!-- Список -->
    <div v-else>
      <div v-if="filtered.length === 0" class="text-gray-500 text-lg text-center py-10">
        У вас пока нет записей
      </div>

      <div class="grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-8">
        <AppointmentCard
          v-for="a in paginated"
          :key="a.id"
          :appointment="a"
          :is-admin="auth.user?.role === 'ADMIN'"
          :is-doctor="auth.user?.role === 'DOCTOR'"
          :is-patient="auth.user?.role === 'PATIENT'"
          @open="open"
          @open-doctor="openDoctorModal"
          @cancel="openCancel"
          @create-visit="openCreateVisit"
        />
      </div>

      <!-- Пагинация -->
      <div v-if="totalPages > 1" class="flex justify-center mt-10 gap-2">
        <button
          v-for="page in totalPages"
          :key="page"
          @click="currentPage = page"
          class="px-4 py-2 rounded-lg border border-teal-300 shadow-sm transition"
          :class="
            page === currentPage
              ? 'bg-teal-600 text-white'
              : 'bg-white hover:bg-teal-50 text-teal-800'
          "
        >
          {{ page }}
        </button>
      </div>
    </div>

    <!-- Модалки записи -->
    <DoctorAppointmentModal v-if="showDoctor" v-model="showDoctor" :appointment="selected" />
    <PatientAppointmentModal v-if="showPatient" v-model="showPatient" :appointment="selected" />

    <AppointmentPatientCancel
      v-if="showCancel"
      v-model="showCancel"
      :appointment="cancelTarget"
      @confirm="cancelAppointment"
    />

    <DoctorModal
      v-if="showDoctorProfile"
      :doctor-id="selectedDoctor?.id"
      :show="showDoctorProfile"
      @close="showDoctorProfile = false"
    />

    <AppointmentCreateWizard v-if="showCreate" v-model="showCreate" @saved="load" />
  </div>

  <!-- 🔥 МОДАЛКА ВЫНЕСЕНА ВНЕ КОНТЕЙНЕРА -->
  <CreateVisitModal
    v-if="showCreateVisit"
    v-model="showCreateVisit"
    :appointment="selectedAppointmentForVisit"
    @created="load"
  />
</template>
