<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getCabinets } from '@/api/cabinets'

import CabinetCard from '@/components/CabinetCard.vue'
import CabinetEditModal from '@/pages/Admin/CabinetEditModal.vue'
import CabinetDeactivateModal from '@/pages/Admin/CabinetDeactivateModal.vue'
import CabinetActivateModal from '@/pages/Admin/CabinetActivateModal.vue'
import ShiftModal from '@/pages/Admin/ShiftModal.vue'
import CreateCabinetModal from '@/pages/Admin/CreateCabinetModal.vue'

const emit = defineEmits(['close'])

const loading = ref(true)
const cabinets = ref<any[]>([])
const error = ref<string | null>(null)

const searchInput = ref('')
const searchQuery = ref('')

const selectedCabinet = ref<any | null>(null)

const showEditModal = ref(false)
const showDeactivateModal = ref(false)
const showActivateModal = ref(false)
const showShiftModal = ref(false)
const showCreateModal = ref(false)

const shiftData = ref({
  doctor: null,
  shift: null,
  date: null,
})

const currentPage = ref(1)
const perPage = 12

async function load() {
  try {
    loading.value = true
    const data = await getCabinets()
    cabinets.value = data
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

const filteredCabinets = computed(() => {
  const q = searchQuery.value
  return cabinets.value.filter((c) => {
    const num = c.number.toLowerCase()
    const spec = c.specialization.toLowerCase()
    return q ? num.includes(q) || spec.includes(q) : true
  })
})

const paginatedCabinets = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredCabinets.value.slice(start, start + perPage)
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredCabinets.value.length / perPage)))

function selectCabinet(c: any) {
  selectedCabinet.value = c
}

function openEdit(c: any) {
  selectedCabinet.value = c
  showEditModal.value = true
}

function openDeactivate(c: any) {
  selectedCabinet.value = c
  showDeactivateModal.value = true
}

function openActivate(c: any) {
  selectedCabinet.value = c
  showActivateModal.value = true
}

function openShift(payload: any) {
  shiftData.value = payload
  showShiftModal.value = true
}

async function reloadAndReselect() {
  const id = selectedCabinet.value?.id
  await load()
  selectedCabinet.value = cabinets.value.find((c) => c.id === id) || null
}

onMounted(load)
</script>

<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div
      class="bg-white w-full max-w-6xl rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto border border-teal-300"
    >
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-teal-800">Управление кабинетами</h2>

        <div class="flex gap-3 items-center">
          <button
            class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow"
            @click="showCreateModal = true"
          >
            + Создать кабинет
          </button>

          <button class="text-sm text-gray-600 hover:text-gray-800" @click="emit('close')">
            Закрыть
          </button>
        </div>
      </div>

      <!-- SEARCH -->
      <div class="relative mb-4">
        <input
          v-model="searchInput"
          @keyup.enter="applySearch"
          class="w-full px-4 py-2 border border-teal-400 rounded-lg shadow-sm"
          placeholder="Поиск по номеру кабинета или специализации"
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
              v-for="c in paginatedCabinets"
              :key="c.id"
              @click="selectCabinet(c)"
              class="p-4 bg-white border border-teal-300 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition"
              :class="selectedCabinet?.id === c.id ? 'border-blue-500 shadow-md' : ''"
            >
              <p class="text-lg font-semibold">Кабинет №{{ c.number }}</p>
              <p class="text-gray-600 text-sm mt-1">
                Специализация: <span class="font-medium">{{ c.specialization }}</span>
              </p>
              <p class="text-xs mt-1">
                <span :class="c.isActive ? 'text-green-600' : 'text-red-600'">
                  {{ c.isActive ? 'Активен' : 'Неактивен' }}
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
          <div v-if="selectedCabinet" class="sticky top-6">
            <CabinetCard
              :cabinet="selectedCabinet"
              :is-admin="true"
              @edit-cabinet="openEdit"
              @create-shift="openShift"
              @updated="reloadAndReselect"
            />

            <div class="mt-4 flex gap-3">
              <button
                v-if="selectedCabinet.isActive"
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow"
                @click="openDeactivate(selectedCabinet)"
              >
                Деактивировать
              </button>

              <button
                v-else
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow"
                @click="openActivate(selectedCabinet)"
              >
                Активировать
              </button>
            </div>
          </div>

          <div v-else class="text-gray-500 text-lg mt-10">Выберите кабинет из списка</div>
        </div>
      </div>

      <!-- MODALS -->
      <CreateCabinetModal
        v-if="showCreateModal"
        :show="showCreateModal"
        @close="showCreateModal = false"
        @created="load"
      />

      <CabinetEditModal
        v-if="showEditModal && selectedCabinet"
        :cabinet="selectedCabinet"
        :show="showEditModal"
        @close="showEditModal = false"
        @updated="
          () => {
            showEditModal = false
            reloadAndReselect()
          }
        "
      />

      <CabinetDeactivateModal
        v-if="showDeactivateModal && selectedCabinet"
        :cabinet="selectedCabinet"
        @close="showDeactivateModal = false"
        @updated="
          () => {
            showDeactivateModal = false
            reloadAndReselect()
          }
        "
      />

      <CabinetActivateModal
        v-if="showActivateModal && selectedCabinet"
        :cabinet="selectedCabinet"
        @close="showActivateModal = false"
        @updated="
          () => {
            showActivateModal = false
            reloadAndReselect()
          }
        "
      />

      <ShiftModal
        v-if="showShiftModal"
        :show="showShiftModal"
        :doctor="shiftData.doctor"
        :shift="shiftData.shift"
        :date="shiftData.date"
        @close="showShiftModal = false"
        @updated="reloadAndReselect"
      />
    </div>
  </div>
</template>
