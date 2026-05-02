<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/api/axios'
import PatientCard from '@/components/PatientCard.vue'
import DoctorModal from '@/components/DoctorModal.vue'

const loading = ref(true)
const patients = ref<any[]>([])
const error = ref<string | null>(null)

const searchInput = ref('')
const searchQuery = ref('')

const selectedPatient = ref<any | null>(null)

const showDoctorProfile = ref(false)
const selectedDoctor = ref<any | null>(null)

async function load() {
  try {
    const res = await api.get('/patients')
    patients.value = res.data
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Ошибка загрузки пациентов'
  } finally {
    loading.value = false
  }
}

function applySearch() {
  searchQuery.value = searchInput.value.trim().toLowerCase()
}

const filteredPatients = computed(() => {
  const q = searchQuery.value

  return patients.value
    .filter((p) => {
      const fullName = `${p.lastName} ${p.firstName} ${p.middleName || ''}`.toLowerCase()
      const card = String(p.medicalCardNumber || '').toLowerCase()
      return q ? fullName.includes(q) || card.includes(q) : true
    })
    .sort((a, b) => a.lastName.localeCompare(b.lastName))
})

function togglePatient(p: any) {
  if (selectedPatient.value?.id === p.id) {
    selectedPatient.value = null
    return
  }
  selectedPatient.value = p
}

function openDoctorModal(doctor: any) {
  selectedDoctor.value = doctor
  showDoctorProfile.value = true
}

onMounted(load)
</script>

<template>
  <div class="max-w-7xl mx-auto p-8 flex gap-10">
    <!-- ЛЕВАЯ КОЛОНКА -->
    <div class="w-1/2">
      <h1 class="text-4xl font-extrabold text-teal-800 tracking-tight mb-6">Пациенты</h1>

      <!-- ПОИСК -->
      <div class="relative mb-6">
        <input
          v-model="searchInput"
          @keyup.enter="applySearch"
          class="w-full px-4 py-3 border border-teal-400 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
          placeholder="Поиск по ФИО или номеру карты"
        />

        <button
          @click="applySearch"
          class="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 opacity-70 hover:opacity-100 transition"
        >
          <img src="@/assets/look.png" alt="search" class="w-6 h-6 object-contain" />
        </button>
      </div>

      <!-- СОСТОЯНИЯ -->
      <div v-if="loading" class="text-gray-600 text-lg">Загрузка...</div>
      <div v-else-if="error" class="text-red-600 text-lg">{{ error }}</div>

      <!-- СПИСОК ПАЦИЕНТОВ -->
      <div v-else class="space-y-3">
        <div
          v-for="p in filteredPatients"
          :key="p.id"
          @click="togglePatient(p)"
          class="p-5 bg-white border border-teal-300 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition"
          :class="selectedPatient?.id === p.id ? 'border-blue-500 shadow-md' : ''"
        >
          <p class="text-lg font-semibold text-gray-900">
            {{ p.lastName }} {{ p.firstName }} {{ p.middleName }}
          </p>

          <p class="text-gray-600 text-sm mt-1">
            Мед. карта:
            <span class="font-medium">{{ p.medicalCardNumber || '—' }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- ПРАВАЯ КОЛОНКА -->
    <div class="w-1/2">
      <div v-if="selectedPatient" class="sticky top-6">
        <PatientCard :patient="selectedPatient" @open-doctor="openDoctorModal" />
      </div>

      <div v-else class="text-gray-500 text-lg mt-10">Выберите пациента из списка</div>
    </div>

    <!-- МОДАЛКА ВРАЧА -->
    <DoctorModal
      v-if="showDoctorProfile"
      :doctor-id="selectedDoctor?.id"
      :show="showDoctorProfile"
      @close="showDoctorProfile = false"
    />
  </div>
</template>
