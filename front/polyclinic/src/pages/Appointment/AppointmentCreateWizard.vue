<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { getDoctors } from '@/api/doctors'
import { getMyProfile } from '@/api/patients'
import { getSlotsForDoctor } from '@/api/schedule'
import { createAppointment } from '@/api/appointments'
import AppointmentCalendar from '@/components/AppointmentCalendar.vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue', 'saved'])

const step = ref(1)

const doctors = ref([])
const therapists = ref([])
const patient = ref(null)

const selectedType = ref<'THERAPIST' | 'SPECIALIST' | null>(null)
const selectedDoctor = ref<any>(null)

const selectedDate = ref<string | null>(null)
const selectedSlot = ref<any>(null)

const calendarDays = ref([])

const slots = ref([])
const loading = ref(false)
const error = ref<string | null>(null)
const message = ref<string | null>(null)

async function load() {
  loading.value = true

  doctors.value = await getDoctors()
  therapists.value = doctors.value.filter((d) => d.isTherapist)

  patient.value = await getMyProfile()

  loading.value = false
}

onMounted(load)

async function loadCalendar(doctorId: number) {
  calendarDays.value = []

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const days: any[] = []

  for (let i = 0; i < 28; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const iso = d.toISOString().split('T')[0]

    const res = await getSlotsForDoctor(doctorId, iso)

    days.push({
      iso,
      isWeekend: res.message === 'Выходной день',
      hasSlots: res.slots.length > 0,
    })
  }

  calendarDays.value = days
}

async function loadSlotsForSelectedDate() {
  if (!selectedDoctor.value || !selectedDate.value) return

  const res = await getSlotsForDoctor(selectedDoctor.value.id, selectedDate.value)

  message.value = res.message || null
  slots.value = res.slots
}

function pickSlot(slot: any) {
  if (!slot.isFree) return
  selectedSlot.value = slot
  step.value = 5
}

async function save() {
  loading.value = true
  error.value = null

  try {
    await createAppointment({
      doctorId: selectedDoctor.value.id,
      date: selectedDate.value,
      startTime: selectedSlot.value.start.slice(11, 16),
    })

    emit('saved')
    step.value = 6
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Ошибка записи'
  } finally {
    loading.value = false
  }
}

function closeWizard() {
  emit('update:modelValue', false)
}

function chooseSpecialist() {
  selectedType.value = 'SPECIALIST'
  step.value = 2
}

async function chooseTherapist() {
  selectedType.value = 'THERAPIST'

  if (!patient.value?.primaryTherapistId) {
    error.value = 'У вас нет участкового терапевта'
    return
  }

  const doc = therapists.value.find((d) => d.id === patient.value.primaryTherapistId)
  if (!doc) {
    error.value = 'Терапевт не найден'
    return
  }

  selectedDoctor.value = doc
  await loadCalendar(doc.id)
  step.value = 3
}

function pickDoctor(d: any) {
  selectedDoctor.value = d
  loadCalendar(d.id)
  step.value = 3
}

watch(selectedDate, () => {
  loadSlotsForSelectedDate()
})
</script>

<template>
  <div v-if="modelValue" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-xl shadow-lg relative">
      <!-- Кнопка закрытия -->
      <button
        class="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
        @click="closeWizard"
      >
        ×
      </button>

      <div v-if="error" class="text-red-600 mb-4">{{ error }}</div>

      <!-- ШАГ 1 -->
      <div v-if="step === 1">
        <h2 class="text-xl font-bold mb-4">Как хотите записаться?</h2>

        <button
          class="w-full px-4 py-2 bg-blue-600 text-white rounded mb-3"
          @click="chooseSpecialist"
        >
          Выбрать специалиста
        </button>

        <button class="w-full px-4 py-2 bg-green-600 text-white rounded" @click="chooseTherapist">
          Записаться к терапевту
        </button>
      </div>

      <!-- ШАГ 2 — выбор врача -->
      <div v-if="step === 2">
        <h2 class="text-xl font-bold mb-4">Выберите врача</h2>

        <div class="max-h-80 overflow-y-auto space-y-2">
          <button
            v-for="d in doctors"
            :key="d.id"
            class="w-full px-4 py-2 border rounded hover:bg-gray-100"
            @click="pickDoctor(d)"
          >
            {{ d.lastName }} {{ d.firstName }} — {{ d.specialization }}
          </button>
        </div>

        <button class="mt-4 px-3 py-1 bg-gray-200 rounded" @click="step = 1">Назад</button>
      </div>

      <!-- ШАГ 3 — календарь -->
      <div v-if="step === 3">
        <h2 class="text-xl font-bold mb-4">Выберите дату</h2>

        <AppointmentCalendar v-model="selectedDate" :days="calendarDays" />

        <div class="mt-4 flex justify-between">
          <button
            class="px-3 py-1 bg-gray-200 rounded"
            @click="step = selectedType === 'SPECIALIST' ? 2 : 1"
          >
            Назад
          </button>

          <button
            class="px-3 py-1 bg-blue-600 text-white rounded"
            :disabled="!selectedDate"
            @click="step = 4"
          >
            Далее
          </button>
        </div>
      </div>

      <!-- ШАГ 4 — выбор времени -->
      <div v-if="step === 4">
        <h2 class="text-xl font-bold mb-4">Выберите время</h2>

        <div v-if="message" class="text-gray-500 mb-3">{{ message }}</div>

        <div class="space-y-2 max-h-80 overflow-y-auto">
          <button
            v-for="s in slots"
            :key="s.start"
            class="w-full px-4 py-2 border rounded"
            :class="s.isFree ? 'hover:bg-gray-100' : 'bg-gray-200 text-gray-500 cursor-not-allowed'"
            @click="pickSlot(s)"
          >
            {{ s.start.slice(11, 16) }} – {{ s.end.slice(11, 16) }}
            <span v-if="!s.isFree">(занято)</span>
          </button>
        </div>

        <button class="mt-4 px-3 py-1 bg-gray-200 rounded" @click="step = 3">Назад</button>
      </div>

      <!-- ШАГ 5 — подтверждение -->
      <div v-if="step === 5">
        <h2 class="text-xl font-bold mb-4">Подтверждение записи</h2>

        <p><b>Врач:</b> {{ selectedDoctor.lastName }} {{ selectedDoctor.firstName }}</p>
        <p><b>Дата:</b> {{ selectedDate }}</p>
        <p>
          <b>Время:</b> {{ selectedSlot.start.slice(11, 16) }} –
          {{ selectedSlot.end.slice(11, 16) }}
        </p>

        <p v-if="error" class="text-red-600 mt-2">{{ error }}</p>

        <div class="mt-4 flex justify-between">
          <button class="px-3 py-1 bg-gray-200 rounded" @click="step = 4">Назад</button>

          <button
            class="px-4 py-1 bg-green-600 text-white rounded"
            @click="save"
            :disabled="loading"
          >
            Записаться
          </button>
        </div>
      </div>

      <!-- ШАГ 6 — успех -->
      <div v-if="step === 6">
        <h2 class="text-xl font-bold mb-4 text-green-700">Запись успешно создана!</h2>

        <button class="mt-4 px-4 py-2 bg-blue-600 text-white rounded" @click="closeWizard">
          Закрыть
        </button>
      </div>
    </div>
  </div>
</template>
