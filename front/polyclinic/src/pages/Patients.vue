<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/api/axios'

import PatientCard from '@/components/PatientCard.vue'
import DoctorModal from '@/components/DoctorModal.vue'

import PatientEditModal from '@/pages/Admin/PatientEditModal.vue'
import PatientDeactivateModal from '@/pages/Admin/PatientDeactivateModal.vue'
import PatientActivateModal from '@/pages/Admin/PatientActivateModal.vue'

const loading = ref(true)
const patients = ref<any[]>([])
const error = ref<string | null>(null)

const searchInput = ref('')
const searchQuery = ref('')

const selectedPatient = ref<any | null>(null)

const showDoctorProfile = ref(false)
const selectedDoctor = ref<any | null>(null)

const role = ref<string | null>(null)

// модалка
const showEditModal = ref(false)
const showDeactivateModal = ref(false)
const showActivateModal = ref(false)

// пагинация
const currentPage = ref(1)
const perPage = 12

async function load() {
  try {
    const me = await api.get('/auth/me')
    role.value = me.data.role

    const res = await api.get('/patients')
    let data = res.data

    // показываем только активных
    data = data.filter((p: any) => p.user?.isActive)

    patients.value = data
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Ошибка загрузки пациентов'
  } finally {
    loading.value = false
  }
}

function applySearch() {
  searchQuery.value = searchInput.value.trim().toLowerCase()
  currentPage.value = 1
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

const paginatedPatients = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredPatients.value.slice(start, start + perPage)
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredPatients.value.length / perPage)))

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

function openEdit(p: any) {
  selectedPatient.value = p
  showEditModal.value = true
}

function openDeactivate(p: any) {
  selectedPatient.value = p
  showDeactivateModal.value = true
}

function openActivate(p: any) {
  selectedPatient.value = p
  showActivateModal.value = true
}

async function reloadAndReselect() {
  const id = selectedPatient.value?.id
  await load()
  selectedPatient.value = patients.value.find((p) => p.id === id) || null
}

onMounted(load)
</script>

<template>
  <div class="max-w-7xl mx-auto p-8 flex flex-col gap-10">
    <!-- Заголовок -->
    <h1 class="text-4xl font-extrabold text-teal-800 tracking-tight">Пациенты</h1>

    <!-- Поиск -->
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

    <!-- Состояния -->
    <div v-if="loading" class="text-gray-600 text-lg text-center py-10">Загрузка...</div>
    <div v-else-if="error" class="text-red-600 text-lg text-center py-10">{{ error }}</div>

    <!-- Контент -->
    <div v-else class="flex gap-10">
      <!-- ЛЕВАЯ КОЛОНКА -->
      <div class="w-1/2 space-y-3">
        <div
          v-for="p in paginatedPatients"
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

        <!-- Пагинация -->
        <div v-if="totalPages > 1" class="flex justify-center mt-6 gap-2">
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

      <!-- ПРАВАЯ КОЛОНКА -->
      <div class="w-1/2">
        <div v-if="selectedPatient" class="sticky top-6">
          <PatientCard
            :patient="selectedPatient"
            :is-admin="role === 'ADMIN'"
            @open-doctor="openDoctorModal"
            @edit="openEdit"
            @deactivate="openDeactivate"
            @activate="openActivate"
          />
        </div>

        <div v-else class="text-gray-500 text-lg mt-10">Выберите пациента из списка</div>
      </div>
    </div>

    <!-- Модалки -->
    <PatientEditModal
      v-if="showEditModal && selectedPatient"
      :patient="selectedPatient"
      @close="showEditModal = false"
      @updated="
        () => {
          showEditModal = false
          reloadAndReselect()
        }
      "
    />

    <PatientDeactivateModal
      v-if="showDeactivateModal && selectedPatient"
      :patient="selectedPatient"
      @close="showDeactivateModal = false"
      @updated="
        () => {
          showDeactivateModal = false
          reloadAndReselect()
        }
      "
    />

    <PatientActivateModal
      v-if="showActivateModal && selectedPatient"
      :patient="selectedPatient"
      @close="showActivateModal = false"
      @updated="
        () => {
          showActivateModal = false
          reloadAndReselect()
        }
      "
    />

    <!-- Модалка врача -->
    <DoctorModal
      v-if="showDoctorProfile"
      :doctor-id="selectedDoctor?.id"
      :show="showDoctorProfile"
      @close="showDoctorProfile = false"
    />
  </div>
</template>
