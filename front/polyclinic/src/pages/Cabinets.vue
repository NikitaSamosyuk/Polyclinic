<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getCabinets, createCabinet } from '@/api/cabinets'
import CabinetCard from '@/components/CabinetCard.vue'
import DoctorModal from '@/components/DoctorModal.vue'
import CabinetEditModal from '@/pages/Cabinet/CabinetEditModal.vue'
import ShiftModal from '@/pages/Cabinet/ShiftModal.vue'
import { useAuthStore } from '@/store/auth.store'

const auth = useAuthStore()

const loading = ref(true)
const cabinets = ref([])
const error = ref(null)

const searchInput = ref('')
const searchQuery = ref('')
const selectedSpecialization = ref('Специализация')

const currentPage = ref(1)
const perPage = 9

const showDoctorModal = ref(false)
const selectedDoctorId = ref<number | null>(null)

const showEditModal = ref(false)
const editCabinet = ref(null)

const showShiftModal = ref(false)
const shiftData = ref<{
  doctor: any | null
  shift: any | null
  cabinetId: number | null
}>({
  doctor: null,
  shift: null,
  cabinetId: null,
})

async function load() {
  loading.value = true
  try {
    const res = await getCabinets()
    cabinets.value = res
  } finally {
    loading.value = false
  }
}

function applySearch() {
  searchQuery.value = searchInput.value.trim().toLowerCase()
  currentPage.value = 1
}

const specializations = computed(() => {
  const set = new Set()
  cabinets.value.forEach((c) => c.doctors.forEach((d) => set.add(d.specialization)))
  return ['Специализация', ...Array.from(set)]
})

const filteredCabinets = computed(() => {
  const q = searchQuery.value

  return cabinets.value.filter((c) => {
    const matchesSearch = q
      ? c.number.toLowerCase().includes(q) ||
        c.doctors.some((d) =>
          `${d.lastName} ${d.firstName} ${d.middleName || ''}`.toLowerCase().includes(q)
        )
      : true

    const matchesSpec =
      selectedSpecialization.value === 'Специализация' ||
      c.doctors.some((d) => d.specialization === selectedSpecialization.value)

    return matchesSearch && matchesSpec
  })
})

const paginatedCabinets = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredCabinets.value.slice(start, start + perPage)
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredCabinets.value.length / perPage)))

function openDoctor(id: number) {
  selectedDoctorId.value = id
  showDoctorModal.value = true
}

function closeDoctor() {
  showDoctorModal.value = false
  selectedDoctorId.value = null
}

function openEdit(cab) {
  editCabinet.value = cab
  showEditModal.value = true
}

function openShift({ doctor, shift }) {
  shiftData.value = {
    doctor,
    shift,
    cabinetId: doctor.cabinetId || doctor.cabinet?.id || null,
  }
  showShiftModal.value = true
}

async function createNewCabinet() {
  const number = prompt('Введите номер кабинета:')
  if (!number) return

  await createCabinet({
    number,
    workingHoursStart: '08:00',
    workingHoursEnd: '18:00',
    slotDuration: 15,
  })

  load()
}

onMounted(load)
</script>

<template>
  <div class="max-w-7xl mx-auto p-6">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-3xl font-bold text-gray-800">Кабинеты</h1>

      <button
        v-if="auth.user?.role === 'ADMIN'"
        @click="createNewCabinet"
        class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        + Создать кабинет
      </button>
    </div>

    <!-- Поиск + фильтр -->
    <div class="flex flex-row justify-between items-start gap-4 mb-6">
      <div class="relative flex-1">
        <input
          v-model="searchInput"
          @keyup.enter="applySearch"
          class="w-full px-4 py-2 border rounded-lg"
          placeholder="Поиск по номеру кабинета или ФИО врача"
        />
        <button
          @click="applySearch"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
        >
          🔍
        </button>
      </div>

      <div class="flex flex-col items-start">
        <select
          v-model="selectedSpecialization"
          @change="applySearch"
          class="px-4 py-2 border rounded-lg bg-white"
        >
          <option v-for="s in specializations" :key="s" :value="s">
            {{ s }}
          </option>
        </select>
      </div>
    </div>

    <!-- Список кабинетов -->
    <div v-if="loading" class="text-gray-600 text-lg">Загрузка...</div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <CabinetCard
        v-for="cab in paginatedCabinets"
        :key="cab.id"
        :cabinet="cab"
        :is-admin="auth.user?.role === 'ADMIN'"
        @updated="load"
        @open-doctor="openDoctor"
        @edit-cabinet="openEdit"
        @create-shift="openShift"
      />
    </div>

    <!-- Пагинация -->
    <div v-if="totalPages > 1" class="flex justify-center mt-6 gap-3">
      <button
        v-for="page in totalPages"
        :key="page"
        @click="currentPage = page"
        class="px-3 py-1 rounded border"
        :class="page === currentPage ? 'bg-blue-600 text-white' : 'bg-white'"
      >
        {{ page }}
      </button>
    </div>

    <!-- Модалки -->
    <DoctorModal
      v-if="showDoctorModal"
      :show="showDoctorModal"
      :doctor-id="selectedDoctorId"
      @close="closeDoctor"
    />

    <CabinetEditModal
      v-if="showEditModal"
      :show="showEditModal"
      :cabinet="editCabinet"
      @close="showEditModal = false"
      @updated="load"
    />

    <!-- ВАЖНО: рендерим ShiftModal только когда ВСЕ данные есть -->
    <ShiftModal
      v-if="showShiftModal && shiftData.doctor && shiftData.cabinetId !== null"
      :show="showShiftModal"
      :shift="shiftData.shift"
      :doctor-id="shiftData.doctor.id"
      :cabinet-id="shiftData.cabinetId"
      @close="showShiftModal = false"
      @updated="load"
    />
  </div>
</template>
