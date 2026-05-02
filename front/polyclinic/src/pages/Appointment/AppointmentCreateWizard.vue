<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { getDoctors } from '@/api/doctors'
import { getMyProfile } from '@/api/patients'
import { getSlotsForDoctor } from '@/api/schedule'
import { createAppointment } from '@/api/appointments'
import AppointmentCalendar from '@/components/AppointmentCalendar.vue'
import DoctorModal from '@/components/DoctorModal.vue' // ✅ ДОБАВЛЕНО

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

// 🔵 Модалка врача
const showDoctorProfile = ref(false)
const selectedDoctorProfile = ref<any>(null)

function openDoctorModal(d: any) {
  selectedDoctorProfile.value = d
  showDoctorProfile.value = true
}

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
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 relative border border-teal-300">
      <!-- Кнопка закрытия -->
      <button
        class="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
        @click="closeWizard"
      >
        ✕
      </button>

      <!-- Шапка -->
      <div class="text-center mb-6">
        <h2 class="text-lg font-bold text-gray-700">Городская поликлиника №165</h2>
        <p class="text-sm text-gray-500 -mt-1">Минск</p>
      </div>

      <div v-if="error" class="text-red-600 mb-4 text-center">{{ error }}</div>

      <!-- ШАГ 1 -->
      <div v-if="step === 1" class="space-y-4">
        <h2 class="text-2xl font-bold text-teal-800 text-center mb-4">Запись на приём</h2>

        <button
          class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          @click="chooseSpecialist"
        >
          Выбрать специалиста
        </button>

        <button
          class="w-full px-4 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
          @click="chooseTherapist"
        >
          Записаться к терапевту
        </button>
      </div>

      <!-- ШАГ 2 — выбор врача -->
      <div v-if="step === 2">
        <h2 class="text-2xl font-bold mb-4 text-teal-800 text-center">Выберите специалиста</h2>

        <div class="max-h-96 overflow-y-auto grid grid-cols-1 gap-3">
          <div
            v-for="d in doctors"
            :key="d.id"
            class="border border-teal-300 rounded-xl p-4 shadow-sm hover:shadow-md hover:bg-teal-50 transition cursor-pointer"
            @click="pickDoctor(d)"
          >
            <div class="flex items-start gap-3">
              <img src="@/assets/doctor-icon.png" class="w-7 h-7 object-contain" />

              <div class="flex-1">
                <div class="flex items-center justify-between gap-3">
                  <p class="font-semibold text-lg text-gray-900 leading-tight">
                    {{ d.lastName }} {{ d.firstName }}
                    <span v-if="d.middleName">{{ d.middleName }}</span>
                  </p>

                  <!-- Синяя кнопка как в AppointmentCard.vue -->
                  <button
                    @click.stop="openDoctorModal(d)"
                    class="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow whitespace-nowrap"
                  >
                    Открыть
                  </button>
                </div>

                <p class="text-sm text-gray-600">
                  {{ d.specialization }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          class="mt-5 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          @click="step = 1"
        >
          Назад
        </button>
      </div>

      <!-- ШАГ 3 — календарь -->
      <div v-if="step === 3">
        <h2 class="text-xl font-bold mb-4 text-teal-800">Выберите дату</h2>

        <AppointmentCalendar v-model="selectedDate" :days="calendarDays" />

        <div class="mt-4 flex justify-between">
          <button
            class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            @click="step = selectedType === 'SPECIALIST' ? 2 : 1"
          >
            Назад
          </button>

          <button
            class="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            :disabled="!selectedDate"
            @click="step = 4"
          >
            Далее
          </button>
        </div>
      </div>

      <!-- ШАГ 4 — выбор времени -->
      <div v-if="step === 4">
        <h2 class="text-xl font-bold mb-4 text-teal-800">Выберите время</h2>

        <div v-if="message" class="text-gray-500 mb-3">{{ message }}</div>

        <div class="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto">
          <button
            v-for="s in slots"
            :key="s.start"
            class="px-3 py-2 rounded-lg text-sm font-medium border transition"
            :class="{
              'bg-teal-600 text-white border-teal-600 shadow-md': selectedSlot?.start === s.start,
              'bg-white border-teal-300 hover:bg-teal-50':
                s.isFree && selectedSlot?.start !== s.start,
              'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed': !s.isFree,
            }"
            @click="s.isFree && pickSlot(s)"
          >
            {{ s.start.slice(11, 16) }}
          </button>
        </div>

        <div class="mt-4 flex justify-between">
          <button
            class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            @click="step = 3"
          >
            Назад
          </button>

          <button
            class="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            :disabled="!selectedSlot"
            @click="step = 5"
          >
            Далее
          </button>
        </div>
      </div>

      <!-- ШАГ 5 — подтверждение -->
      <div v-if="step === 5">
        <h2 class="text-xl font-bold mb-4 text-teal-800">Подтверждение записи</h2>

        <div class="space-y-1 text-gray-800">
          <p>
            <b>Врач:</b> {{ selectedDoctor.lastName }} {{ selectedDoctor.firstName }}
            {{ selectedDoctor.middleName }}
          </p>
          <p><b>Специальность:</b> {{ selectedDoctor.specialization }}</p>
          <p><b>Дата:</b> {{ selectedDate }}</p>
          <p><b>Время:</b> {{ selectedSlot.start.slice(11, 16) }}</p>
        </div>

        <div class="mt-4 flex justify-between">
          <button
            class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            @click="step = 4"
          >
            Назад
          </button>

          <button
            class="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
            @click="save"
            :disabled="loading"
          >
            Записаться
          </button>
        </div>
      </div>

      <!-- ШАГ 6 — успех -->
      <div v-if="step === 6" class="text-center">
        <h2 class="text-2xl font-bold mb-4 text-green-700">Запись успешно создана!</h2>

        <button
          class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          @click="closeWizard"
        >
          Закрыть
        </button>
      </div>
    </div>

    <!-- 🔵 Модалка врача -->
    <DoctorModal
      v-if="showDoctorProfile"
      :doctor-id="selectedDoctorProfile?.id"
      :show="showDoctorProfile"
      @close="showDoctorProfile = false"
    />
  </div>
</template>
