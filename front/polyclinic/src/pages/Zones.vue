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

const showCreate = ref(false)
const showEdit = ref(false)
const showDelete = ref(false)

const showDoctor = ref(false)
const selectedDoctorId = ref<number | null>(null)

const searchInput = ref('')
const searchQuery = ref('')
const selectedSpecialization = ref('Специальность')
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

  if (searchQuery.value) {
    arr = arr.filter((d) => {
      const full =
        `${d.doctor.lastName} ${d.doctor.firstName} ${d.doctor.middleName || ''}`.toLowerCase()
      return full.includes(searchQuery.value)
    })
  }

  if (selectedSpecialization.value !== 'Специальность') {
    arr = arr.filter((d) => d.doctor.specialization === selectedSpecialization.value)
  }

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

const openedDoctorIds = ref<number[]>([])

function toggleDoctor(d: any) {
  const id = d.doctorId
  if (openedDoctorIds.value.includes(id)) {
    openedDoctorIds.value = openedDoctorIds.value.filter((x) => x !== id)
  } else {
    openedDoctorIds.value = [...openedDoctorIds.value, id]
  }
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
  <div class="max-w-7xl mx-auto p-8 flex flex-col gap-10">
    <h1 class="text-4xl font-extrabold text-teal-800 tracking-tight">Зоны терапевтов</h1>

    <!-- Поиск + фильтры -->
    <div class="bg-white border border-teal-400 rounded-xl shadow p-6 flex flex-col gap-6">
      <div class="flex flex-col md:flex-row gap-6">
        <!-- Поиск -->
        <div class="relative flex-1">
          <input
            v-model="searchInput"
            @keyup.enter="applySearch"
            class="w-full px-4 py-3 border border-teal-400 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
            placeholder="Поиск по ФИО врача"
          />

          <button
            @click="applySearch"
            class="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 opacity-70 hover:opacity-100 transition"
          >
            <img src="@/assets/look.png" alt="search" class="w-6 h-6 object-contain" />
          </button>
        </div>

        <!-- Фильтры -->
        <div class="flex flex-row gap-4">
          <select
            v-model="selectedSpecialization"
            @change="applySearch"
            class="px-4 py-3 border border-teal-400 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-teal-500"
          >
            <option v-for="s in specializations" :key="s" :value="s">
              {{ s }}
            </option>
          </select>

          <select
            v-model="selectedStreet"
            @change="applySearch"
            class="px-4 py-3 border border-teal-400 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-teal-500"
          >
            <option v-for="s in streets" :key="s" :value="s">
              {{ s }}
            </option>
          </select>
        </div>

        <!-- Создать зону -->
        <button
          v-if="isAdmin"
          @click="showCreate = true"
          class="px-5 py-3 bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700 transition"
        >
          + Создать зону
        </button>
      </div>
    </div>

    <!-- Список врачей -->
    <div v-if="loading" class="text-gray-600 text-lg text-center py-10">Загрузка...</div>
    <div v-else-if="error" class="text-red-600 text-lg text-center py-10">{{ error }}</div>

    <div v-else class="flex flex-col gap-8">
      <div
        v-for="d in paginated"
        :key="d.doctorId"
        class="bg-white border border-teal-300 rounded-xl shadow p-6 flex flex-col gap-4 cursor-pointer hover:shadow-lg transition"
        @click="toggleDoctor(d)"
      >
        <!-- Врач -->
        <div class="flex items-start gap-3">
          <img src="@/assets/doctor-icon.png" class="w-7 h-7 object-contain" />

          <div class="flex-1">
            <div class="flex justify-between items-center">
              <p class="font-semibold text-lg text-gray-900 leading-tight">
                {{ d.doctor.lastName }} {{ d.doctor.firstName }}
                <span v-if="d.doctor.middleName">{{ d.doctor.middleName }}</span>
              </p>

              <button
                @click.stop="openDoctorModal(d.doctor)"
                class="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow"
              >
                Открыть
              </button>
            </div>

            <p class="text-sm text-gray-600">{{ d.doctor.specialization }}</p>
          </div>
        </div>

        <!-- Зоны врача -->
        <ZoneCard
          :zones="d.zones"
          :opened="openedDoctorIds.includes(d.doctorId)"
          :isAdmin="isAdmin"
          @select="selectZone"
          @delete="deleteZone"
        />
      </div>
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
