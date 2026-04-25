<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/axios'
import ZoneCard from '@/components/ZoneCard.vue'
import ZoneForm from './Zones/ZoneForm.vue'
import ZoneDelete from './Zones/ZoneDelete.vue'

const router = useRouter()

const zones = ref([])
const loading = ref(true)
const error = ref(null)

const selectedZone = ref(null)
const openedDoctorId = ref(null)

const showCreate = ref(false)
const showEdit = ref(false)
const showDelete = ref(false)

const searchInput = ref('')
const searchQuery = ref('')
const selectedSpecialization = ref('Специальность')

const currentPage = ref(1)
const perPage = 6 // оптимально для зон

async function load() {
  try {
    const res = await api.get('/therapist-zones')
    zones.value = res.data
  } catch (e) {
    error.value = e?.response?.data?.message || 'Ошибка загрузки'
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
  zones.value.forEach((z) => set.add(z.doctor.specialization))
  return ['Специальность', ...Array.from(set)]
})

const grouped = computed(() => {
  const map = new Map()

  for (const z of zones.value) {
    if (!map.has(z.doctorId)) {
      map.set(z.doctorId, {
        doctorId: z.doctorId,
        doctor: z.doctor,
        zones: [],
      })
    }
    map.get(z.doctorId).zones.push(z)
  }

  let arr = Array.from(map.values())

  // Фильтр по ФИО
  if (searchQuery.value) {
    arr = arr.filter((d) => {
      const full =
        `${d.doctor.lastName} ${d.doctor.firstName} ${d.doctor.middleName || ''}`.toLowerCase()
      return full.includes(searchQuery.value)
    })
  }

  // Фильтр по специальности
  if (selectedSpecialization.value !== 'Специальность') {
    arr = arr.filter((d) => d.doctor.specialization === selectedSpecialization.value)
  }

  return arr
})

const paginated = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return grouped.value.slice(start, start + perPage)
})

const totalPages = computed(() => Math.max(1, Math.ceil(grouped.value.length / perPage)))

function toggleDoctor(d) {
  openedDoctorId.value = openedDoctorId.value === d.doctorId ? null : d.doctorId
}

function selectZone(z) {
  selectedZone.value = z
  showEdit.value = true
}

function deleteZone(z) {
  selectedZone.value = z
  showDelete.value = true
}

function openDoctor(d) {
  router.push(`/doctors/${d.id}`)
}

function onCreated(z) {
  zones.value.push(z)
  showCreate.value = false
}

function onUpdated(z) {
  const idx = zones.value.findIndex((x) => x.id === z.id)
  if (idx !== -1) zones.value[idx] = z
  showEdit.value = false
}

function onDeleted(id) {
  zones.value = zones.value.filter((z) => z.id !== id)
  showDelete.value = false
}

onMounted(load)
</script>

<template>
  <div class="p-6 max-w-6xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">Зоны терапевтов</h1>

    <!-- ПОИСК + ФИЛЬТР -->
    <div class="flex flex-row justify-between items-start gap-4 mb-6">
      <div class="relative flex-1">
        <input
          v-model="searchInput"
          @keyup.enter="applySearch"
          class="w-full px-4 py-2 border rounded-lg"
          placeholder="Поиск по ФИО врача"
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

      <button @click="showCreate = true" class="px-4 py-2 bg-green-600 text-white rounded-lg">
        + Создать
      </button>
    </div>

    <div v-if="loading" class="text-gray-600">Загрузка...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>

    <!-- СПИСОК -->
    <div v-else class="space-y-4">
      <div
        v-for="d in paginated"
        :key="d.doctorId"
        class="p-4 bg-white border rounded-lg shadow cursor-pointer hover:shadow-md"
        @click="toggleDoctor(d)"
      >
        <div class="flex items-center gap-3">
          <p class="font-semibold text-lg text-gray-800">
            {{ d.doctor.lastName }} {{ d.doctor.firstName }} {{ d.doctor.middleName || '' }}
          </p>

          <button
            @click.stop="openDoctor(d.doctor)"
            class="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Открыть
          </button>
        </div>

        <p class="text-gray-600 text-sm mb-2">{{ d.doctor.specialization }}</p>

        <ZoneCard
          :zones="d.zones"
          :opened="openedDoctorId === d.doctorId"
          @select="selectZone"
          @delete="deleteZone"
        />
      </div>
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

    <ZoneForm v-if="showCreate" mode="create" @close="showCreate = false" @saved="onCreated" />
    <ZoneForm
      v-if="showEdit"
      mode="edit"
      :zone="selectedZone"
      @close="showEdit = false"
      @saved="onUpdated"
    />
    <ZoneDelete
      v-if="showDelete"
      :zone="selectedZone"
      @close="showDelete = false"
      @deleted="onDeleted"
    />
  </div>
</template>
