<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { deactivateCabinet, updateCabinet } from '@/api/cabinets'

const props = defineProps<{
  cabinet: any
  isAdmin: boolean
}>()

const emit = defineEmits<{
  (e: 'updated'): void
  (e: 'open-doctor', id: number): void
  (e: 'edit-cabinet', cabinet: any): void
  (e: 'create-shift', payload: { doctor: any; shift: any | null; date: string }): void
}>()

const expanded = ref(false)
const confirmDelete = ref(false)

// --- Недели ---
const weekOffset = ref(0) // теперь 0..4 → 5 недель
const selectedDate = ref<string | null>(null)

const dayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт']

function getBaseMonday(): Date {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const monday = new Date(today)
  const wd = today.getDay()

  if (wd === 0) monday.setDate(today.getDate() + 1)
  else monday.setDate(today.getDate() - (wd - 1))

  return monday
}

function getWeekDays(offset: number) {
  const baseMonday = getBaseMonday()
  const monday = new Date(baseMonday)
  monday.setDate(baseMonday.getDate() + offset * 7)

  const result = []

  for (let i = 0; i < 5; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    d.setHours(0, 0, 0, 0)

    const iso = d.toISOString().split('T')[0]
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')

    result.push({
      iso,
      label: dayLabels[i],
      display: `${dd}.${mm}`,
    })
  }

  return result
}

const days = computed(() => getWeekDays(weekOffset.value))

watch(
  () => days.value,
  (val) => {
    if (!selectedDate.value && val.length > 0) {
      selectedDate.value = val[0].iso
    } else if (val.length > 0 && !val.some((d) => d.iso === selectedDate.value)) {
      selectedDate.value = val[0].iso
    }
  },
  { immediate: true }
)

function prevWeek() {
  if (weekOffset.value > 0) weekOffset.value--
}

function nextWeek() {
  if (weekOffset.value < 4) weekOffset.value++ // 5 недель
}

// --- Смены ---
function normalizeDateToIso(date: string | Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().split('T')[0]
}

const doctorsWithShiftsForDay = computed(() => {
  if (!selectedDate.value) return []

  const targetIso = selectedDate.value
  const doctors = props.cabinet.doctors || []
  const shifts = props.cabinet.shifts || []

  return doctors.map((doc: any) => {
    const docShifts = shifts.filter((s: any) => {
      if (!s || !s.date) return false
      return normalizeDateToIso(s.date) === targetIso && s.doctorId === doc.id
    })

    return { doctor: doc, shifts: docShifts }
  })
})

async function deactivate() {
  await deactivateCabinet(props.cabinet.id)
  emit('updated')
}

async function activate() {
  await updateCabinet(props.cabinet.id, { isActive: true })
  emit('updated')
}

function openDoctor(id: number) {
  emit('open-doctor', id)
}

function openShift(doctor: any, shift: any | null) {
  if (!selectedDate.value) return
  emit('create-shift', { doctor, shift, date: selectedDate.value })
}
</script>

<template>
  <div class="border rounded-lg p-4 shadow-sm bg-white flex flex-col gap-3">
    <!-- Заголовок -->
    <div class="flex justify-between items-center cursor-pointer" @click="expanded = !expanded">
      <div>
        <h2 class="text-xl font-semibold">Кабинет №{{ cabinet.number }}</h2>
        <p class="text-sm text-gray-500">
          {{ cabinet.workingHoursStart }} — {{ cabinet.workingHoursEnd }}
        </p>
      </div>

      <span
        v-if="isAdmin"
        class="px-2 py-1 rounded text-xs"
        :class="cabinet.isActive ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'"
      >
        {{ cabinet.isActive ? 'Активен' : 'Неактивен' }}
      </span>
    </div>

    <!-- Свернутое -->
    <div v-if="!expanded" class="text-gray-700">
      <p class="mt-2 font-semibold">Специализации врачей:</p>
      <p class="ml-1 text-gray-600">
        {{
          cabinet.doctors.length === 0
            ? '—'
            : Array.from(new Set(cabinet.doctors.map((d: any) => d.specialization))).join(', ')
        }}
      </p>
    </div>

    <!-- Развернутое -->
    <div v-else class="space-y-4 text-gray-700">
      <!-- Параметры кабинета -->
      <div v-if="isAdmin" class="bg-gray-50 p-3 rounded border">
        <p><b>Специализация кабинета:</b> {{ cabinet.specialization }}</p>
        <p><b>Длительность слота:</b> {{ cabinet.slotDuration }} мин</p>
        <p><b>Рабочее время:</b> {{ cabinet.workingHoursStart }}–{{ cabinet.workingHoursEnd }}</p>
      </div>

      <!-- Навигация по неделям -->
      <div class="flex items-center justify-between gap-2">
        <button
          class="px-2 py-1 text-sm rounded border bg-white hover:bg-gray-50 disabled:opacity-40"
          @click.stop="prevWeek"
          :disabled="weekOffset === 0"
        >
          ←
        </button>

        <div class="flex-1 flex justify-center gap-2 overflow-x-auto">
          <button
            v-for="d in days"
            :key="d.iso"
            @click.stop="selectedDate = d.iso"
            class="px-3 py-2 rounded border text-sm flex flex-col items-center min-w-[64px]"
            :class="
              selectedDate === d.iso
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-800'
            "
          >
            <span class="font-semibold">{{ d.label }}</span>
            <span class="text-xs">{{ d.display }}</span>
          </button>
        </div>

        <button
          class="px-2 py-1 text-sm rounded border bg-white hover:bg-gray-50 disabled:opacity-40"
          @click.stop="nextWeek"
          :disabled="weekOffset === 4"
        >
          →
        </button>
      </div>

      <!-- Врачи и смены -->
      <div v-if="selectedDate">
        <p class="font-semibold mb-2">
          Расписание на {{ days.find((d) => d.iso === selectedDate)?.display }}:
        </p>

        <div
          v-for="item in doctorsWithShiftsForDay"
          :key="item.doctor.id"
          class="border rounded-lg p-3 bg-gray-50 mb-3"
        >
          <div class="flex justify-between items-center">
            <div>
              <p class="font-semibold">
                {{ item.doctor.lastName }} {{ item.doctor.firstName }}
                <span v-if="item.doctor.middleName">{{ item.doctor.middleName }}</span>
              </p>
              <p class="text-sm text-gray-500">{{ item.doctor.specialization }}</p>
            </div>

            <button
              @click.stop="openDoctor(item.doctor.id)"
              class="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Открыть
            </button>
          </div>

          <div class="mt-3">
            <p class="font-semibold text-sm mb-1">Смены:</p>

            <ul class="ml-2 space-y-1">
              <li v-for="s in item.shifts" :key="s.id" class="flex items-center gap-3 text-sm">
                <span>🕒 {{ s.startTime }}–{{ s.endTime }}</span>

                <button
                  v-if="isAdmin"
                  @click.stop="openShift(item.doctor, s)"
                  class="text-blue-600 text-xs underline"
                >
                  Изменить
                </button>
              </li>

              <li v-if="item.shifts.length === 0" class="text-gray-500 ml-2 text-sm">Нет смен</li>
            </ul>

            <button
              v-if="isAdmin"
              @click.stop="openShift(item.doctor, null)"
              class="mt-2 text-xs text-green-700 underline"
            >
              + Создать смену
            </button>
          </div>
        </div>
      </div>

      <!-- Управление кабинетом -->
      <div v-if="isAdmin" class="mt-3 flex gap-3">
        <button
          @click.stop="emit('edit-cabinet', cabinet)"
          class="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Редактировать
        </button>

        <!-- Активировать -->
        <button
          v-if="!cabinet.isActive"
          @click.stop="activate"
          class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Активировать
        </button>

        <!-- Деактивировать -->
        <button
          v-if="cabinet.isActive && !confirmDelete"
          @click.stop="confirmDelete = true"
          class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Деактивировать
        </button>

        <div v-else-if="cabinet.isActive" class="flex gap-3">
          <button
            @click.stop="deactivate"
            class="px-3 py-1 bg-red-700 text-white rounded hover:bg-red-800"
          >
            Подтвердить
          </button>
          <button
            @click.stop="confirmDelete = false"
            class="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
