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
  <div
    class="bg-white border border-teal-300 rounded-xl shadow-md p-5 flex flex-col gap-4 hover:shadow-lg transition"
  >
    <!-- Заголовок -->
    <div
      class="flex justify-between items-center cursor-pointer pb-2 border-b border-gray-200"
      @click="expanded = !expanded"
    >
      <div>
        <h2 class="text-2xl font-bold text-teal-800">Кабинет №{{ cabinet.number }}</h2>
        <p class="text-sm text-gray-500">
          {{ cabinet.workingHoursStart }} — {{ cabinet.workingHoursEnd }}
        </p>
      </div>

      <span
        v-if="isAdmin"
        class="px-3 py-1 rounded-full text-xs font-semibold shadow-sm"
        :class="
          cabinet.isActive
            ? 'bg-green-100 text-green-700 border border-green-300'
            : 'bg-red-100 text-red-700 border border-red-300'
        "
      >
        {{ cabinet.isActive ? 'Активен' : 'Неактивен' }}
      </span>
    </div>

    <!-- Свернутое -->
    <div v-if="!expanded" class="text-gray-700">
      <p class="mt-1 font-semibold text-teal-700">Специализации врачей:</p>
      <p class="ml-1 text-gray-600">
        {{
          cabinet.doctors.length === 0
            ? '—'
            : Array.from(new Set(cabinet.doctors.map((d: any) => d.specialization))).join(', ')
        }}
      </p>
    </div>

    <!-- Развернутое -->
    <div v-else class="space-y-5 text-gray-700">
      <!-- Параметры кабинета -->
      <div
        v-if="isAdmin"
        class="bg-teal-50 border border-teal-200 rounded-lg p-4 shadow-sm space-y-1"
      >
        <p><b>Специализация кабинета:</b> {{ cabinet.specialization }}</p>
        <p><b>Длительность слота:</b> {{ cabinet.slotDuration }} мин</p>
        <p><b>Рабочее время:</b> {{ cabinet.workingHoursStart }}–{{ cabinet.workingHoursEnd }}</p>
      </div>

      <!-- Навигация по неделям -->
      <div class="flex items-center justify-between gap-3">
        <button
          class="px-3 py-1.5 text-sm rounded-lg border border-teal-300 bg-white hover:bg-teal-50 disabled:opacity-40"
          @click.stop="prevWeek"
          :disabled="weekOffset === 0"
        >
          ← Неделя
        </button>

        <div class="flex-1 flex justify-center gap-2 overflow-x-auto">
          <button
            v-for="d in days"
            :key="d.iso"
            @click.stop="selectedDate = d.iso"
            class="px-4 py-2 rounded-lg border text-sm flex flex-col items-center min-w-[70px] shadow-sm"
            :class="
              selectedDate === d.iso
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
            "
          >
            <span class="font-semibold">{{ d.label }}</span>
            <span class="text-xs">{{ d.display }}</span>
          </button>
        </div>

        <button
          class="px-3 py-1.5 text-sm rounded-lg border border-teal-300 bg-white hover:bg-teal-50 disabled:opacity-40"
          @click.stop="nextWeek"
          :disabled="weekOffset === 4"
        >
          Неделя →
        </button>
      </div>

      <!-- Врачи и смены -->
      <div v-if="selectedDate">
        <p class="font-semibold mb-3 text-teal-800 text-lg">
          Расписание на {{ days.find((d) => d.iso === selectedDate)?.display }}:
        </p>

        <div
          v-for="item in doctorsWithShiftsForDay"
          :key="item.doctor.id"
          class="border border-gray-200 rounded-xl p-4 bg-gray-50 shadow-sm"
        >
          <div class="flex justify-between items-center">
            <div>
              <p class="font-semibold text-gray-900">
                {{ item.doctor.lastName }} {{ item.doctor.firstName }}
                <span v-if="item.doctor.middleName">{{ item.doctor.middleName }}</span>
              </p>
              <p class="text-sm text-gray-500">{{ item.doctor.specialization }}</p>
            </div>

            <button
              @click.stop="openDoctor(item.doctor.id)"
              class="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow"
            >
              Открыть
            </button>
          </div>

          <div class="mt-3">
            <p class="font-semibold text-sm mb-1 text-teal-700">Смена:</p>

            <ul class="ml-2 space-y-1">
              <li
                v-for="s in item.shifts"
                :key="s.id"
                class="flex items-center gap-3 text-sm bg-white px-3 py-1.5 rounded border border-gray-200 shadow-sm"
              >
                <span class="text-gray-700">🕒 {{ s.startTime }}–{{ s.endTime }}</span>

                <button
                  v-if="isAdmin"
                  @click.stop="openShift(item.doctor, s)"
                  class="text-blue-600 text-xs underline hover:text-blue-800"
                >
                  Изменить
                </button>
              </li>

              <li v-if="item.shifts.length === 0" class="text-gray-500 ml-2 text-sm italic">
                Нет смен
              </li>
            </ul>

            <button
              v-if="isAdmin"
              @click.stop="openShift(item.doctor, null)"
              class="mt-2 text-xs text-green-700 underline hover:text-green-900"
            >
              + Создать смену
            </button>
          </div>
        </div>
      </div>

      <!-- Управление кабинетом -->
      <div v-if="isAdmin" class="mt-4 flex gap-3">
        <button
          @click.stop="emit('edit-cabinet', cabinet)"
          class="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 shadow"
        >
          Редактировать
        </button>

        <button
          v-if="!cabinet.isActive"
          @click.stop="activate"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow"
        >
          Активировать
        </button>

        <button
          v-if="cabinet.isActive && !confirmDelete"
          @click.stop="confirmDelete = true"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow"
        >
          Деактивировать
        </button>

        <div v-else-if="cabinet.isActive" class="flex gap-3">
          <button
            @click.stop="deactivate"
            class="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 shadow"
          >
            Подтвердить
          </button>
          <button
            @click.stop="confirmDelete = false"
            class="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 shadow"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
