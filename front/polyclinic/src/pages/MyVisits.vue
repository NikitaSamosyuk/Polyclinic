<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth.store'
import { getMyVisits, deleteVisit, updateVisit } from '@/api/visits'

import VisitCard from '@/components/VisitCard.vue'
import VisitDeleteModal from '@/pages/visit/VisitDeleteModal.vue'
import VisitEditModal from '@/pages/visit/VisitEditModal.vue'

const auth = useAuthStore()

const loading = ref(true)
const visits = ref<any[]>([])
const error = ref<string | null>(null)

const searchInput = ref('')
const searchQuery = ref('')

// Фильтры
const filterYear = ref('')
const filterMonth = ref('')
const filterDay = ref('')
const filterTime = ref('')

// Пагинация
const currentPage = ref(1)
const perPage = 10

// Модалки
const showDelete = ref(false)
const showEdit = ref(false)
const selectedVisit = ref<any>(null)

async function load() {
  loading.value = true
  try {
    visits.value = await getMyVisits()
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Ошибка загрузки визитов'
  } finally {
    loading.value = false
  }
}

function applySearch() {
  searchQuery.value = searchInput.value.trim().toLowerCase()
  currentPage.value = 1
}

function getDate(d: string) {
  return d ? d.slice(0, 10) : ''
}

function getTime(d: string) {
  return d ? d.slice(11, 16) : ''
}

const filtered = computed(() => {
  const q = searchQuery.value

  let list = visits.value.filter((v) => {
    const doctor =
      `${v.doctor.lastName} ${v.doctor.firstName} ${v.doctor.middleName || ''}`.toLowerCase()

    const date = getDate(v.visitDatetime)
    const time = getTime(v.visitDatetime)

    const matchSearch = doctor.includes(q)
    const matchYear = filterYear.value ? date.startsWith(filterYear.value) : true
    const matchMonth = filterMonth.value ? date.slice(5, 7) === filterMonth.value : true
    const matchDay = filterDay.value ? date.slice(8, 10) === filterDay.value : true
    const matchTime = filterTime.value ? time === filterTime.value : true

    return matchSearch && matchYear && matchMonth && matchDay && matchTime
  })

  list = list.sort((a, b) => a.visitDatetime.localeCompare(b.visitDatetime))

  return list
})

const paginated = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filtered.value.slice(start, start + perPage)
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage)))

const years = computed(() => {
  const set = new Set(visits.value.map((v) => getDate(v.visitDatetime).slice(0, 4)))
  return [...set].filter(Boolean)
})

const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']

const days = computed(() => {
  let list = visits.value

  if (filterYear.value) {
    list = list.filter((v) => getDate(v.visitDatetime).startsWith(filterYear.value))
  }

  if (filterMonth.value) {
    list = list.filter((v) => getDate(v.visitDatetime).slice(5, 7) === filterMonth.value)
  }

  const set = new Set(list.map((v) => getDate(v.visitDatetime).slice(8, 10)))
  return [...set].filter(Boolean).sort()
})

const times = computed(() => {
  const set = new Set(visits.value.map((v) => getTime(v.visitDatetime)))
  return [...set].filter(Boolean).sort()
})

/* ---------------- МОДАЛКИ ---------------- */

function openDeleteModal(visit: any) {
  selectedVisit.value = visit
  showDelete.value = true
}

function openEditModal(visit: any) {
  selectedVisit.value = visit
  showEdit.value = true
}

async function confirmDelete(visit: any) {
  try {
    await deleteVisit(visit.id)
    showDelete.value = false
    await load()
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Ошибка удаления визита')
  }
}

async function saveEdit(dto: any) {
  try {
    await updateVisit(selectedVisit.value.id, dto)
    showEdit.value = false
    await load()
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Ошибка обновления визита')
  }
}

onMounted(load)
</script>

<template>
  <div class="max-w-7xl mx-auto p-8 flex flex-col gap-10">
    <h1 class="text-4xl font-extrabold text-teal-800 tracking-tight">Мои визиты</h1>

    <!-- Панель поиска + фильтров -->
    <div class="bg-white border border-teal-400 rounded-xl shadow p-6 flex flex-col gap-6">
      <div class="relative">
        <input
          v-model="searchInput"
          @keyup.enter="applySearch"
          class="w-full px-4 py-3 border border-teal-400 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
          placeholder="Поиск по врачу"
        />

        <button
          @click="applySearch"
          class="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 opacity-70 hover:opacity-100 transition"
        >
          <img src="@/assets/look.png" alt="search" class="w-6 h-6 object-contain" />
        </button>
      </div>

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
    <div v-else-if="error" class="text-red-600 text-lg text-center py-10">{{ error }}</div>
    <div v-else-if="filtered.length === 0" class="text-gray-500 text-lg text-center py-10">
      У вас пока нет визитов
    </div>

    <!-- Сетка визитов -->
    <div v-else class="grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-8">
      <VisitCard
        v-for="v in paginated"
        :key="v.id"
        :visit="v"
        :isAdmin="auth.user?.role === 'ADMIN'"
        :isDoctor="auth.user?.role === 'DOCTOR'"
        :isPatient="auth.user?.role === 'PATIENT'"
        @delete-visit="openDeleteModal"
        @edit-visit="openEditModal"
        class="self-start"
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

  <!-- Модалки -->
  <VisitDeleteModal
    v-if="showDelete"
    :open="showDelete"
    :visit="selectedVisit"
    @close="showDelete = false"
    @confirm="confirmDelete"
  />

  <VisitEditModal
    v-if="showEdit"
    :open="showEdit"
    :visit="selectedVisit"
    @close="showEdit = false"
    @save="saveEdit"
  />
</template>
