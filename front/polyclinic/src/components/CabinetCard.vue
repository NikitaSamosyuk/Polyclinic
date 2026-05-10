<script setup lang="ts">
import { ref, computed, watch } from 'vue'

import CabinetEditModal from '@/pages/Admin/CabinetEditModal.vue'
import CabinetDeactivateModal from '@/pages/Admin/CabinetDeactivateModal.vue'
import CabinetActivateModal from '@/pages/Admin/CabinetActivateModal.vue'
import ShiftModal from '@/pages/Admin/ShiftModal.vue'
import ExtendWeekModal from '@/pages/Admin/ExtendWeekModal.vue'
import { getShiftsForDoctor } from '@/api/shifts'

const props = defineProps<{
  cabinet: any
  isAdmin: boolean
}>()

const emit = defineEmits<{
  (e: 'updated'): void
  (e: 'open-doctor', id: number): void
}>()

const expanded = ref(false)

const showEditModal = ref(false)
const showDeactivateModal = ref(false)
const showActivateModal = ref(false)
const showShiftModal = ref(false)

const showExtendWeekModal = ref(false)
const extendWeekDoctorId = ref<number | null>(null)

const shiftData = ref({
  doctor: null,
  shift: null,
  date: null,
  cabinet: null,
})

const weekOffset = ref(0)
const selectedDate = ref<string | null>(null)

const dayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт']

function getBaseMonday(): Date {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const wd = today.getDay() // 0–6
  const monday = new Date(today)

  if (wd === 0) monday.setDate(today.getDate() + 1)
  else monday.setDate(today.getDate() - (wd - 1))

  return monday
}

function formatISO(d: Date) {
  return d.toLocaleDateString('en-CA') // YYYY-MM-DD
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

    const iso = formatISO(d)
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
  if (weekOffset.value < 4) weekOffset.value++
}

const doctorsWithShiftsForDay = ref([])

watch(
  () => selectedDate.value,
  async (date) => {
    if (!date) {
      doctorsWithShiftsForDay.value = []
      return
    }

    const doctors = props.cabinet.doctors || []
    const result = []

    for (const doc of doctors) {
      const shifts = await getShiftsForDoctor(doc.id, date)
      result.push({ doctor: doc, shifts })
    }

    doctorsWithShiftsForDay.value = result
  },
  { immediate: true }
)

function openDoctor(id: number) {
  emit('open-doctor', id)
}

function openShift(doctor: any, shift: any | null) {
  if (!selectedDate.value) return

  shiftData.value = {
    doctor,
    shift,
    date: selectedDate.value,
    cabinet: props.cabinet,
  }

  showShiftModal.value = true
}

function openExtendWeek(doctorId: number) {
  extendWeekDoctorId.value = doctorId
  showExtendWeekModal.value = true
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

            <div class="flex gap-2">
              <button
                @click.stop="openDoctor(item.doctor.id)"
                class="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow"
              >
                Открыть
              </button>

              <button
                v-if="isAdmin"
                @click.stop="openExtendWeek(item.doctor.id)"
                class="px-3 py-1 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow"
              >
                Продлить неделю
              </button>
            </div>
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
          @click.stop="showEditModal = true"
          class="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 shadow"
        >
          Редактировать
        </button>

        <button
          v-if="cabinet.isActive"
          @click.stop="showDeactivateModal = true"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow"
        >
          Деактивировать
        </button>

        <button
          v-else
          @click.stop="showActivateModal = true"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow"
        >
          Активировать
        </button>
      </div>
    </div>

    <!-- МОДАЛКИ -->
    <CabinetEditModal
      v-if="showEditModal"
      :show="showEditModal"
      :cabinet="cabinet"
      @close="showEditModal = false"
      @updated="emit('updated')"
    />

    <CabinetDeactivateModal
      v-if="showDeactivateModal"
      :cabinet="cabinet"
      @close="showDeactivateModal = false"
      @updated="emit('updated')"
    />

    <CabinetActivateModal
      v-if="showActivateModal"
      :cabinet="cabinet"
      @close="showActivateModal = false"
      @updated="emit('updated')"
    />

    <ShiftModal
      v-if="showShiftModal"
      :show="showShiftModal"
      :doctor="shiftData.doctor"
      :shift="shiftData.shift"
      :date="shiftData.date"
      :cabinet="shiftData.cabinet"
      @close="showShiftModal = false"
      @updated="emit('updated')"
    />

    <ExtendWeekModal
      v-if="showExtendWeekModal"
      :show="showExtendWeekModal"
      :doctorId="extendWeekDoctorId"
      @close="showExtendWeekModal = false"
      @updated="emit('updated')"
    />
  </div>
</template>
