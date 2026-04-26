<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { getDoctors } from '@/api/doctors'
import { getSlotsForDoctor } from '@/api/schedule'
import { rescheduleAppointment } from '@/api/appointments'
import AppointmentCalendar from '@/components/AppointmentCalendar.vue'

const props = defineProps<{
  modelValue: boolean
  appointment: any
}>()

const emit = defineEmits(['update:modelValue', 'saved'])

const step = ref(1)

const doctors = ref([])
const selectedDoctor = ref<any>(null)

const selectedDate = ref<string | null>(null)
const selectedSlot = ref<any>(null)

const calendarDays = ref([])
const slots = ref([])

const loading = ref(false)
const error = ref<string | null>(null)
const message = ref<string | null>(null)

async function load() {
  if (!props.appointment) return

  loading.value = true
  error.value = null

  doctors.value = await getDoctors()

  // текущий врач
  selectedDoctor.value = doctors.value.find((d) => d.id === props.appointment.doctorId)

  // текущая дата
  selectedDate.value = props.appointment.appointmentDate.slice(0, 10)

  await loadCalendar(selectedDoctor.value.id)
  await loadSlotsForSelectedDate()

  // текущий слот
  selectedSlot.value = {
    start: props.appointment.startTime,
    end: props.appointment.endTime,
    isFree: true,
  }

  loading.value = false
}

watch(
  () => props.modelValue,
  (v) => {
    if (v) {
      step.value = 1
      load()
    }
  }
)

function close() {
  emit('update:modelValue', false)
}

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

function pickDoctor(d: any) {
  selectedDoctor.value = d
  loadCalendar(d.id)
  step.value = 2
}

function pickSlot(slot: any) {
  if (!slot.isFree) return
  selectedSlot.value = slot
  step.value = 4
}

async function save() {
  loading.value = true
  error.value = null

  try {
    await rescheduleAppointment(props.appointment.id, {
      doctorId: selectedDoctor.value.id,
      date: selectedDate.value,
      startTime: selectedSlot.value.start.slice(11, 16),
    })

    emit('saved')
    step.value = 5
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Ошибка переноса'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div v-if="modelValue" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-xl shadow-lg relative">
      <button class="absolute top-3 right-3 text-gray-500 hover:text-black text-xl" @click="close">
        ×
      </button>

      <div v-if="error" class="text-red-600 mb-4">{{ error }}</div>

      <!-- ШАГ 1 — выбор врача -->
      <div v-if="step === 1">
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

        <button class="mt-4 px-3 py-1 bg-gray-200 rounded" @click="close">Отмена</button>
      </div>

      <!-- ШАГ 2 — календарь -->
      <div v-if="step === 2">
        <h2 class="text-xl font-bold mb-4">Выберите дату</h2>

        <AppointmentCalendar v-model="selectedDate" :days="calendarDays" />

        <div class="mt-4 flex justify-between">
          <button class="px-3 py-1 bg-gray-200 rounded" @click="step = 1">Назад</button>
          <button
            class="px-3 py-1 bg-blue-600 text-white rounded"
            :disabled="!selectedDate"
            @click="step = 3"
          >
            Далее
          </button>
        </div>
      </div>

      <!-- ШАГ 3 — выбор времени -->
      <div v-if="step === 3">
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

        <button class="mt-4 px-3 py-1 bg-gray-200 rounded" @click="step = 2">Назад</button>
      </div>

      <!-- ШАГ 4 — подтверждение -->
      <div v-if="step === 4">
        <h2 class="text-xl font-bold mb-4">Подтверждение переноса</h2>

        <p><b>Врач:</b> {{ selectedDoctor.lastName }} {{ selectedDoctor.firstName }}</p>
        <p><b>Дата:</b> {{ selectedDate }}</p>
        <p>
          <b>Время:</b> {{ selectedSlot.start.slice(11, 16) }} –
          {{ selectedSlot.end.slice(11, 16) }}
        </p>

        <div class="mt-4 flex justify-between">
          <button class="px-3 py-1 bg-gray-200 rounded" @click="step = 3">Назад</button>

          <button
            class="px-4 py-1 bg-green-600 text-white rounded"
            @click="save"
            :disabled="loading"
          >
            Перенести
          </button>
        </div>
      </div>

      <!-- ШАГ 5 — успех -->
      <div v-if="step === 5">
        <h2 class="text-xl font-bold mb-4 text-green-700">Запись успешно перенесена!</h2>

        <button class="mt-4 px-4 py-2 bg-blue-600 text-white rounded" @click="close">
          Закрыть
        </button>
      </div>
    </div>
  </div>
</template>
