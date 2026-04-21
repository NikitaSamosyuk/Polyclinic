<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import api from '../api/axios'

const doctors = ref([])
const loadingDoctors = ref(true)

const form = ref({
  doctorId: '',
  date: '',
  reason: '',
})

const slots = ref<any[]>([])
const cabinetId = ref<number | null>(null)
const loadingSlots = ref(false)
const selectedSlot = ref<any | null>(null)

const error = ref('')
const success = ref(false)

// --- Загрузка списка врачей ---
onMounted(async () => {
  try {
    const res = await api.get('/doctors')
    doctors.value = res.data
  } catch (e) {
    console.error('Ошибка загрузки врачей', e)
  } finally {
    loadingDoctors.value = false
  }
})

// --- Загрузка слотов врача ---
async function loadSlots() {
  slots.value = []
  selectedSlot.value = null
  cabinetId.value = null

  if (!form.value.doctorId || !form.value.date) return

  loadingSlots.value = true

  try {
    const res = await api.get('/schedule/doctor', {
      params: {
        doctorId: form.value.doctorId,
        date: form.value.date,
      },
    })

    cabinetId.value = res.data.cabinetId
    slots.value = res.data.slots
  } catch (e) {
    console.error('Ошибка загрузки слотов', e)
    slots.value = []
  } finally {
    loadingSlots.value = false
  }
}

// --- Автозагрузка слотов при изменении врача или даты ---
watch(() => form.value.doctorId, loadSlots)
watch(() => form.value.date, loadSlots)

// --- Создание записи ---
async function submit() {
  error.value = ''
  success.value = false

  if (!selectedSlot.value) {
    error.value = 'Выберите свободный слот'
    return
  }

  try {
    await api.post('/appointments/slot', {
      doctorId: Number(form.value.doctorId),
      cabinetId: cabinetId.value,
      appointmentDate: form.value.date,
      startTime: selectedSlot.value.start,
      endTime: selectedSlot.value.end,
      reason: form.value.reason,
    })

    success.value = true
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Ошибка записи'
  }
}

function formatTime(value: string | Date) {
  const d = new Date(value)
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="appointment-page">
    <h1>Запись к врачу</h1>

    <div v-if="loadingDoctors" class="loading">Загрузка врачей...</div>

    <form v-else @submit.prevent="submit">
      <label>
        Врач:
        <select v-model="form.doctorId" required>
          <option disabled value="">Выберите врача</option>
          <option v-for="d in doctors" :key="d.id" :value="d.id">
            {{ d.lastName }} {{ d.firstName }} ({{ d.specialization }})
          </option>
        </select>
      </label>

      <label>
        Дата:
        <input type="date" v-model="form.date" required />
      </label>

      <label>
        Причина визита:
        <textarea v-model="form.reason" required></textarea>
      </label>

      <div class="slots-block">
        <h3>Свободные слоты</h3>

        <div v-if="loadingSlots" class="loading">Загрузка слотов...</div>

        <div v-else-if="slots.length === 0" class="empty">Нет слотов на выбранную дату</div>

        <div v-else class="slots">
          <button
            v-for="s in slots"
            :key="s.start"
            type="button"
            class="slot"
            :class="{ busy: !s.isFree, selected: selectedSlot?.start === s.start }"
            :disabled="!s.isFree"
            @click="selectedSlot = s"
          >
            {{ formatTime(s.start) }} — {{ formatTime(s.end) }}
          </button>
        </div>
      </div>

      <button type="submit" class="submit-btn">Записаться</button>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">Запись успешно создана!</p>
    </form>
  </div>
</template>

<style scoped>
.appointment-page {
  padding: 20px;
  max-width: 500px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

label {
  display: flex;
  flex-direction: column;
  font-weight: 500;
}

.slots-block {
  margin-top: 10px;
}

.slots {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.slot {
  padding: 6px 10px;
  border: 1px solid #2b6cb0;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

.slot.busy {
  background: #ddd;
  border-color: #aaa;
  cursor: not-allowed;
}

.slot.selected {
  background: #2b6cb0;
  color: white;
}

.submit-btn {
  padding: 10px;
  background: #1e1e1e;
  color: white;
  border: none;
  cursor: pointer;
}

.error {
  color: red;
}

.success {
  color: green;
}
</style>
