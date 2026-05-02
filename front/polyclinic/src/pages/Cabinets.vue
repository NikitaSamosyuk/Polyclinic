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
const shiftData = ref({
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
  <div class="max-w-7xl mx-auto p-8 space-y-10">
    <!-- Заголовок + кнопка -->
    <div class="flex justify-between items-center">
      <h1 class="text-4xl font-extrabold text-teal-800 tracking-tight">Кабинеты</h1>

      <button
        v-if="auth.user?.role === 'ADMIN'"
        @click="createNewCabinet"
        class="px-5 py-2.5 bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700 transition"
      >
        + Создать кабинет
      </button>
    </div>

    <!-- Поиск + фильтр -->
    <div
      class="bg-white border border-teal-400 rounded-xl shadow p-6 flex flex-col md:flex-row gap-6"
    >
      <!-- Поиск -->
      <div class="relative flex-1">
        <input
          v-model="searchInput"
          @keyup.enter="applySearch"
          class="w-full px-4 py-3 border border-teal-400 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-400 focus:outline-none"
          placeholder="Поиск по номеру кабинета или ФИО врача"
        />

        <button
          @click="applySearch"
          class="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 opacity-70 hover:opacity-100 transition"
        >
          <img src="@/assets/look.png" alt="search" class="w-6 h-6 object-contain" />
        </button>
      </div>

      <!-- Фильтр -->
      <div>
        <select
          v-model="selectedSpecialization"
          @change="applySearch"
          class="px-4 py-3 border border-teal-400 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-teal-400"
        >
          <option v-for="s in specializations" :key="s" :value="s">
            {{ s }}
          </option>
        </select>
      </div>
    </div>

    <!-- Список кабинетов -->
    <div v-if="loading" class="text-gray-600 text-lg text-center py-10">Загрузка...</div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
    <div v-if="totalPages > 1" class="flex justify-center mt-8 gap-2">
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
