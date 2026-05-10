<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { patientsApi } from '@/api/patients'

import PatientCard from '@/components/PatientCard.vue'
import PatientEditModal from '@/pages/Admin/PatientEditModal.vue'
import PatientDeactivateModal from '@/pages/Admin/PatientDeactivateModal.vue'
import PatientActivateModal from '@/pages/Admin/PatientActivateModal.vue'

const emit = defineEmits(['close'])

const loading = ref(true)
const patients = ref<any[]>([])
const error = ref<string | null>(null)

const searchInput = ref('')
const searchQuery = ref('')

const selectedPatient = ref<any | null>(null)

const showEditModal = ref(false)
const showDeactivateModal = ref(false)
const showActivateModal = ref(false)

const currentPage = ref(1)
const perPage = 12

async function load() {
  try {
    loading.value = true
    const data = await patientsApi.getAll()
    patients.value = data
  } catch (e) {
    error.value = 'Ошибка загрузки'
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
  return patients.value.filter((p) => {
    const full = `${p.lastName} ${p.firstName} ${p.middleName || ''}`.toLowerCase()
    const card = String(p.medicalCardNumber || '').toLowerCase()
    return q ? full.includes(q) || card.includes(q) : true
  })
})

const paginatedPatients = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredPatients.value.slice(start, start + perPage)
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredPatients.value.length / perPage)))

function selectPatient(p: any) {
  selectedPatient.value = p
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
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div
      class="bg-white w-full max-w-6xl rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto border border-teal-300"
    >
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-teal-800">Управление пациентами</h2>
        <button class="text-sm text-gray-600 hover:text-gray-800" @click="emit('close')">
          Закрыть
        </button>
      </div>

      <!-- SEARCH -->
      <div class="relative mb-4">
        <input
          v-model="searchInput"
          @keyup.enter="applySearch"
          class="w-full px-4 py-2 border border-teal-400 rounded-lg shadow-sm"
          placeholder="Поиск по ФИО или номеру карты"
        />
        <button
          @click="applySearch"
          class="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
        >
          <img src="@/assets/look.png" class="w-6 h-6" />
        </button>
      </div>

      <div v-if="loading" class="text-gray-600 py-6">Загрузка...</div>
      <div v-else-if="error" class="text-red-600 py-6">{{ error }}</div>

      <div v-else class="flex gap-6">
        <!-- LEFT LIST -->
        <div class="w-1/2">
          <div class="space-y-3">
            <div
              v-for="p in paginatedPatients"
              :key="p.id"
              @click="selectPatient(p)"
              class="p-4 bg-white border border-teal-300 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition"
              :class="selectedPatient?.id === p.id ? 'border-blue-500 shadow-md' : ''"
            >
              <p class="text-lg font-semibold">
                {{ p.lastName }} {{ p.firstName }} {{ p.middleName }}
              </p>
              <p class="text-gray-600 text-sm mt-1">
                Мед. карта: <span class="font-medium">{{ p.medicalCardNumber || '—' }}</span>
              </p>
              <p class="text-xs mt-1">
                <span :class="p.user?.isActive ? 'text-green-600' : 'text-red-600'">
                  {{ p.user?.isActive ? 'Активен' : 'Неактивен' }}
                </span>
              </p>
            </div>
          </div>

          <!-- PAGINATION -->
          <div class="flex justify-center mt-4 gap-2">
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

        <!-- RIGHT CARD -->
        <div class="w-1/2">
          <div v-if="selectedPatient" class="sticky top-6">
            <PatientCard
              :patient="selectedPatient"
              :is-admin="true"
              @edit="openEdit"
              @deactivate="openDeactivate"
              @activate="openActivate"
            />
          </div>

          <div v-else class="text-gray-500 text-lg mt-10">Выберите пациента из списка</div>
        </div>
      </div>

      <!-- MODALS -->
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
    </div>
  </div>
</template>
