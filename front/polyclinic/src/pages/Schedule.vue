<script setup lang="ts">
import { ref, computed, onMounted, watchEffect } from 'vue'
import { getCabinets } from '@/api/cabinets'
import CabinetCard from '@/components/CabinetCard.vue'
import ShiftModal from '@/pages/Cabinet/ShiftModal.vue'
import { useAuthStore } from '@/store/auth.store'

const auth = useAuthStore()

const loading = ref(true)
const cabinets = ref<any[]>([])

const selectedDate = ref<string | null>(null)

const showShiftModal = ref(false)
const shiftData = ref({
  doctor: null as any,
  shift: null as any,
  cabinetId: null as number | null,
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

/**
 * Локальный формат даты YYYY-MM-DD (без UTC-сдвигов)
 */
function toLocalISO(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

onMounted(load)

/**
 * Пн–Пт актуальной недели (как на бэке):
 * - если сегодня Пн–Сб → текущая неделя
 * - если сегодня Вс → следующая неделя
 */
const days = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const monday = new Date(today)
  const wd = today.getDay() // 0–6

  if (wd === 0) {
    // воскресенье → понедельник = завтра
    monday.setDate(today.getDate() + 1)
  } else {
    // Пн–Сб → обычный расчёт
    monday.setDate(today.getDate() - (wd - 1))
  }

  const labels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт']
  const result: { iso: string; label: string }[] = []

  for (let i = 0; i < 5; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)

    result.push({
      iso: toLocalISO(d),
      label: labels[i],
    })
  }

  return result
})

/**
 * Автовыбор первого дня, когда список дней посчитан
 */
watchEffect(() => {
  if (!selectedDate.value && days.value.length > 0) {
    selectedDate.value = days.value[0].iso
  }
})

/**
 * Фильтрация кабинетов по выбранному дню
 */
const filteredCabinets = computed(() => {
  if (!selectedDate.value) return []

  return cabinets.value.map((cab) => {
    const shifts = (cab.shifts ?? []).filter((s: any) => {
      const shiftDate = toLocalISO(s.date)
      return shiftDate === selectedDate.value
    })

    return { ...cab, shifts }
  })
})

/**
 * Открытие модалки смены
 */
function openShift({ doctor, shift }: { doctor: any; shift: any }) {
  shiftData.value = {
    doctor,
    shift,
    cabinetId: doctor.cabinetId || doctor.cabinet?.id || null,
  }
  showShiftModal.value = true
}
</script>

<template>
  <div class="max-w-7xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">Расписание</h1>

    <!-- Дни недели -->
    <div class="flex gap-3 overflow-x-auto pb-3 mb-6">
      <button
        v-for="d in days"
        :key="d.iso"
        @click="selectedDate = d.iso"
        class="px-4 py-2 rounded border whitespace-nowrap"
        :class="selectedDate === d.iso ? 'bg-blue-600 text-white' : 'bg-white'"
      >
        {{ d.label }}
      </button>
    </div>

    <div v-if="loading" class="text-gray-600 text-lg">Загрузка...</div>

    <div v-else-if="selectedDate" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <CabinetCard
        v-for="cab in filteredCabinets"
        :key="cab.id"
        :cabinet="cab"
        :is-admin="auth.user?.role === 'ADMIN'"
        @updated="load"
        @create-shift="openShift"
      />
    </div>

    <div v-else class="text-gray-600 text-lg">Нет доступных дней для отображения расписания</div>

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
