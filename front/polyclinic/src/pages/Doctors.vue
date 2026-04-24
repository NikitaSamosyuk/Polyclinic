<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { doctorsApi } from '@/api/doctors'
import DoctorCard from '@/components/DoctorCard.vue'

const loading = ref(true)
const doctors = ref<any[]>([])
const error = ref<string | null>(null)

const searchInput = ref('')
const searchQuery = ref('')
const selectedSpecialization = ref('Специальность')
const filterTherapist = ref(false)

const currentPage = ref(1)
const perPage = 12

async function load() {
  try {
    const res = await doctorsApi.getAll()
    doctors.value = res
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Ошибка загрузки врачей'
  } finally {
    loading.value = false
  }
}

function applySearch() {
  searchQuery.value = searchInput.value.trim().toLowerCase()
  currentPage.value = 1
}

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

onMounted(load)
</script>

<template>
  <div class="max-w-7xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-4 text-gray-800">Врачи</h1>

    <!-- ВЕРХНИЙ КОНТЕЙНЕР -->
    <div class="flex flex-row justify-between items-start gap-4 mb-6">
      <div class="relative flex-1">
        <input
          v-model="searchInput"
          @keyup.enter="applySearch"
          class="w-full px-4 py-2 border rounded-lg"
          placeholder="Поиск по ФИО"
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

        <label class="flex items-center gap-2 cursor-pointer mt-2">
          <input type="checkbox" v-model="filterTherapist" @change="applySearch" />
          <span class="text-gray-700">Только терапевты</span>
        </label>
      </div>
    </div>

    <!-- СПИСОК ВРАЧЕЙ -->
    <div v-if="loading" class="text-gray-600 text-lg">Загрузка...</div>
    <div v-else-if="error" class="text-red-600 text-lg">{{ error }}</div>

    <!-- ВАЖНО: flex + wrap + фиксированные карточки -->
    <div v-else class="flex flex-wrap gap-6 justify-center" style="align-items: flex-start">
      <DoctorCard v-for="d in paginatedDoctors" :key="d.id" :doctor="d" />
    </div>

    <!-- ПАГИНАЦИЯ -->
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
  </div>
</template>
