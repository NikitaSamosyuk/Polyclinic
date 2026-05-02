<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { doctorsApi } from '@/api/doctors'
import { useAuthStore } from '@/store/auth.store'
import DoctorCard from '@/components/DoctorCard.vue'

import EditDoctorModal from '@/pages/Admin/DoctorEditModal.vue'
import DoctorActivateModal from '@/pages/Admin/DoctorActivateModal.vue'
import DoctorDeactivateModal from '@/pages/Admin/DoctorDeactiveModal.vue'

const auth = useAuthStore()
const isAdmin = auth.user?.role === 'ADMIN'

const loading = ref(true)
const doctors = ref<any[]>([])
const error = ref<string | null>(null)

const searchInput = ref('')
const searchQuery = ref('')
const selectedSpecialization = ref('Специальность')
const filterTherapist = ref(false)

const currentPage = ref(1)
const perPage = 12

// --- ADMIN MODALS ---
const showDeactivateConfirm = ref(false)
const showActivateConfirm = ref(false)
const showEditModal = ref(false)
const selectedDoctor = ref<any | null>(null)

// --- LOAD DOCTORS ---
async function load() {
  loading.value = true
  try {
    const res = isAdmin ? await doctorsApi.getAll() : await doctorsApi.getAllActive()
    doctors.value = res
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Ошибка загрузки врачей'
  } finally {
    loading.value = false
  }
}

// --- SEARCH ---
function applySearch() {
  searchQuery.value = searchInput.value.trim().toLowerCase()
  currentPage.value = 1
}

// --- FILTERS ---
const specializations = computed(() => {
  const set = new Set<string>()
  doctors.value.forEach((d) => set.add(d.specialization))
  return ['Специальность', ...Array.from(set)]
})

const filteredDoctors = computed(() => {
  const q = searchQuery.value

  return doctors.value.filter((d) => {
    const fullName = `${d.lastName} ${d.firstName} ${d.middleName || ''}`.toLowerCase()

    const matchesName = q ? fullName.includes(q) : true
    const matchesSpecialization =
      selectedSpecialization.value === 'Специальность' ||
      d.specialization === selectedSpecialization.value
    const matchesTherapist = filterTherapist.value ? d.isTherapist : true

    return matchesName && matchesSpecialization && matchesTherapist
  })
})

const paginatedDoctors = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredDoctors.value.slice(start, start + perPage)
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredDoctors.value.length / perPage)))

// --- ADMIN ACTIONS ---
function requestDeactivate(d: any) {
  selectedDoctor.value = d
  showDeactivateConfirm.value = true
}

function requestActivate(d: any) {
  selectedDoctor.value = d
  showActivateConfirm.value = true
}

function requestEdit(d: any) {
  selectedDoctor.value = d
  showEditModal.value = true
}

async function confirmDeactivate() {
  await doctorsApi.deactivate(selectedDoctor.value.id)
  showDeactivateConfirm.value = false
  await load()
}

async function confirmActivate() {
  await doctorsApi.activate(selectedDoctor.value.id)
  showActivateConfirm.value = false
  await load()
}

onMounted(load)
</script>

<template>
  <div class="max-w-7xl mx-auto p-8 flex flex-col gap-10">
    <div class="flex justify-between items-center">
      <h1 class="text-4xl font-extrabold text-teal-800 tracking-tight">Врачи</h1>

      <button
        v-if="isAdmin"
        class="bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700 transition"
        @click="$router.push('/admin')"
      >
        Создать врача
      </button>
    </div>

    <!-- Поиск + фильтры -->
    <div
      class="bg-white border border-teal-400 rounded-xl shadow p-6 flex flex-col md:flex-row gap-6"
    >
      <div class="relative flex-1">
        <input
          v-model="searchInput"
          @keyup.enter="applySearch"
          class="w-full px-4 py-3 border border-teal-400 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
          placeholder="Поиск по ФИО"
        />

        <button
          @click="applySearch"
          class="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 opacity-70 hover:opacity-100 transition"
        >
          <img src="@/assets/look.png" alt="search" class="w-6 h-6 object-contain" />
        </button>
      </div>

      <div class="flex flex-col items-start gap-3">
        <select
          v-model="selectedSpecialization"
          @change="applySearch"
          class="px-4 py-3 border border-teal-400 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-teal-500"
        >
          <option v-for="s in specializations" :key="s" :value="s">{{ s }}</option>
        </select>

        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            v-model="filterTherapist"
            @change="applySearch"
            class="w-4 h-4 accent-teal-600"
          />
          <span class="text-gray-700">Только терапевты</span>
        </label>
      </div>
    </div>

    <!-- Состояния -->
    <div v-if="loading" class="text-gray-600 text-lg text-center py-10">Загрузка...</div>

    <div v-else-if="error" class="text-red-600 text-lg text-center py-10">{{ error }}</div>

    <!-- Сетка врачей -->
    <div v-else class="grid grid-cols-[repeat(auto-fit,260px)] justify-center gap-8">
      <DoctorCard
        v-for="d in paginatedDoctors"
        :key="d.id"
        :doctor="d"
        adminMode
        @edit="requestEdit"
        @activate="requestActivate"
        @deactivate="requestDeactivate"
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

  <!-- Модалка редактирования -->
  <EditDoctorModal
    v-if="showEditModal"
    :doctor="selectedDoctor"
    @close="showEditModal = false"
    @updated="load"
  />

  <!-- Модалка деактивации -->
  <div
    v-if="showDeactivateConfirm"
    class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
  >
    <div class="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
      <h2 class="text-xl font-bold mb-4">Деактивировать врача?</h2>
      <p class="text-gray-700 mb-6">
        Вы уверены, что хотите деактивировать врача
        <b>{{ selectedDoctor.lastName }} {{ selectedDoctor.firstName }}</b
        >?
      </p>

      <div class="flex justify-end gap-3">
        <button class="px-4 py-2 bg-gray-300 rounded" @click="showDeactivateConfirm = false">
          Отмена
        </button>
        <button class="px-4 py-2 bg-red-600 text-white rounded" @click="confirmDeactivate">
          Деактивировать
        </button>
      </div>
    </div>
  </div>

  <!-- Модалка активации -->
  <div
    v-if="showActivateConfirm"
    class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
  >
    <div class="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
      <h2 class="text-xl font-bold mb-4">Активировать врача?</h2>
      <p class="text-gray-700 mb-6">
        Активировать врача
        <b>{{ selectedDoctor.lastName }} {{ selectedDoctor.firstName }}</b
        >?
      </p>

      <div class="flex justify-end gap-3">
        <button class="px-4 py-2 bg-gray-300 rounded" @click="showActivateConfirm = false">
          Отмена
        </button>
        <button class="px-4 py-2 bg-green-600 text-white rounded" @click="confirmActivate">
          Активировать
        </button>
      </div>
    </div>
  </div>
</template>
