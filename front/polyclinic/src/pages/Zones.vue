<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import api from '@/api/axios'
import ZoneCard from '@/components/ZoneCard.vue'
import ZoneForm from './Zones/ZoneForm.vue'
import ZoneDelete from './Zones/ZoneDelete.vue'
import DoctorModal from '@/components/DoctorModal.vue'

const zones = ref<any[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const selectedZone = ref<any | null>(null)
const openedDoctorId = ref<number | null>(null)

const showCreate = ref(false)
const showEdit = ref(false)
const showDelete = ref(false)

const showDoctor = ref(false)
const selectedDoctorId = ref<number | null>(null)

const searchInput = ref('')
const searchQuery = ref('')
const selectedSpecialization = ref('Специальность')

// Глобальный фильтр по улице
const selectedStreet = ref('Все улицы')

const currentPage = ref(1)
const perPage = 6

const role = localStorage.getItem('role')
const isAdmin = role === 'ADMIN'

async function load() {
  try {
    const res = await api.get('/therapist-zones')
    zones.value = res.data
  } catch (e: any) {
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
  const set = new Set<string>()
  zones.value.forEach((z: any) => set.add(z.doctor.specialization))
  return ['Специальность', ...Array.from(set)]
})

// список всех улиц (глобальный селект)
const streets = computed(() => {
  const set = new Set<string>()
  zones.value.forEach((z: any) => set.add(z.street))
  return ['Все улицы', ...Array.from(set)]
})

const grouped = computed(() => {
  const map = new Map<number, { doctorId: number; doctor: any; zones: any[] }>()

  for (const z of zones.value) {
    if (!map.has(z.doctorId)) {
      map.set(z.doctorId, {
        doctorId: z.doctorId,
        doctor: z.doctor,
        zones: [],
      })
    }
    map.get(z.doctorId)!.zones.push(z)
  }

  let arr = Array.from(map.values())

  // фильтр по ФИО
  if (searchQuery.value) {
    arr = arr.filter((d) => {
      const full =
        `${d.doctor.lastName} ${d.doctor.firstName} ${d.doctor.middleName || ''}`.toLowerCase()
      return full.includes(searchQuery.value)
    })
  }

  // фильтр по специальности
  if (selectedSpecialization.value !== 'Специальность') {
    arr = arr.filter((d) => d.doctor.specialization === selectedSpecialization.value)
  }

  // глобальный фильтр по улице
  if (selectedStreet.value !== 'Все улицы') {
    arr = arr
      .map((d) => ({
        ...d,
        zones: d.zones.filter((z: any) => z.street === selectedStreet.value),
      }))
      .filter((d) => d.zones.length > 0)
  }

  return arr
})

const paginated = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return grouped.value.slice(start, start + perPage)
})

const totalPages = computed(() => Math.max(1, Math.ceil(grouped.value.length / perPage)))

function toggleDoctor(d: { doctorId: number }) {
  openedDoctorId.value = openedDoctorId.value === d.doctorId ? null : d.doctorId
}

function selectZone(z: any) {
  selectedZone.value = z
  showEdit.value = true
}

function deleteZone(z: any) {
  selectedZone.value = z
  showDelete.value = true
}

function openDoctorModal(doctor: any) {
  selectedDoctorId.value = doctor.id
  showDoctor.value = true
}

function onCreated(z: any) {
  zones.value.push(z)
  showCreate.value = false
}

function onUpdated(z: any) {
  const idx = zones.value.findIndex((x: any) => x.id === z.id)
  if (idx !== -1) zones.value[idx] = z
  showEdit.value = false
}

function onDeleted(id: number) {
  zones.value = zones.value.filter((z: any) => z.id !== id)
  showDelete.value = false
}

onMounted(load)
</script>

<template>
  <div class="p-6 max-w-6xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">Зоны терапевтов</h1>

    <!-- ПОИСК + ФИЛЬТРЫ -->
    <div class="flex flex-row justify-between items-start gap-4 mb-6">
      <!-- Поиск по ФИО -->
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

      <!-- Специальность + улица -->
      <div class="flex flex-col items-start gap-2">
        <select
          v-model="selectedSpecialization"
          @change="applySearch"
          class="px-4 py-2 border rounded-lg bg-white"
        >
          <option v-for="s in specializations" :key="s" :value="s">
            {{ s }}
          </option>
        </select>

        <select v-model="selectedStreet" class="px-4 py-2 border rounded-lg bg-white text-sm">
          <option v-for="s in streets" :key="s" :value="s">
            {{ s }}
          </option>
        </select>
      </div>

      <!-- Создание зоны только для админа -->
      <button
        v-if="isAdmin"
        @click="showCreate = true"
        class="px-4 py-2 bg-green-600 text-white rounded-lg"
      >
        + Создать зону
      </button>
    </div>

    <div v-if="loading" class="text-gray-600">Загрузка...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>

    <!-- СПИСОК ВРАЧЕЙ + ИХ ЗОНЫ -->
    <div v-else class="space-y-4">
      <div
        v-for="d in paginated"
        :key="d.doctorId"
        class="p-4 bg-white border rounded-lg shadow hover:shadow-md"
      >
        <!-- Шапка карточки врача -->
        <div class="flex justify-between items-center mb-2">
          <p class="font-semibold text-lg text-gray-800">
            {{ d.doctor.lastName }} {{ d.doctor.firstName }}
            <span v-if="d.doctor.middleName">
              {{ d.doctor.middleName }}
            </span>
          </p>

          <button
            @click.stop="openDoctorModal(d.doctor)"
            class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Открыть
          </button>
        </div>

        <p class="text-gray-600 text-sm mb-2">
          {{ d.doctor.specialization }}
        </p>

        <!-- Тоггл зон -->
        <div class="cursor-pointer" @click="toggleDoctor(d)">
          <p class="text-sm text-blue-700">
            {{ openedDoctorId === d.doctorId ? 'Скрыть зоны' : 'Показать зоны' }}
          </p>
        </div>

        <!-- Зоны врача -->
        <ZoneCard
          :zones="d.zones"
          :opened="openedDoctorId === d.doctorId"
          :isAdmin="isAdmin"
          @select="selectZone"
          @delete="deleteZone"
        />
      </div>
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

    <!-- Формы -->
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

    <!-- Модалка врача -->
    <DoctorModal
      v-if="showDoctor"
      :doctor-id="selectedDoctorId"
      :show="showDoctor"
      @close="showDoctor = false"
    />
  </div>
</template>
