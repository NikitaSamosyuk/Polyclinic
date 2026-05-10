<script setup lang="ts">
import { ref } from 'vue'
import { createShift, updateShift, deleteShift } from '@/api/shifts'

const props = defineProps<{
  show: boolean
  doctor: any
  shift: any | null
  date: string
  cabinet: any
}>()

const emit = defineEmits(['close', 'updated'])

const form = ref({
  startTime: props.shift?.startTime ?? props.cabinet.workingHoursStart,
  endTime: props.shift?.endTime ?? props.cabinet.workingHoursEnd,
})

function timeToMinutes(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function isWithinCabinet(start: string, end: string) {
  const s = timeToMinutes(start)
  const e = timeToMinutes(end)
  const cs = timeToMinutes(props.cabinet.workingHoursStart)
  const ce = timeToMinutes(props.cabinet.workingHoursEnd)
  return s >= cs && e <= ce
}

async function save() {
  if (!isWithinCabinet(form.value.startTime, form.value.endTime)) {
    alert(
      `Смена должна быть внутри рабочего времени кабинета: 
${props.cabinet.workingHoursStart}–${props.cabinet.workingHoursEnd}`
    )
    return
  }

  if (props.shift) {
    await updateShift(props.shift.id, {
      startTime: form.value.startTime,
      endTime: form.value.endTime,
    })
  } else {
    await createShift({
      doctorId: props.doctor.id,
      cabinetId: props.cabinet.id,
      date: props.date,
      startTime: form.value.startTime,
      endTime: form.value.endTime,
    })
  }

  emit('updated')
  emit('close')
}

async function remove() {
  if (!props.shift) return
  await deleteShift(props.shift.id)
  emit('updated')
  emit('close')
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-md border border-teal-300 space-y-6">
      <h2 class="text-2xl font-bold text-teal-800">
        {{ shift ? 'Редактировать смену' : 'Создать смену' }}
      </h2>

      <p class="text-gray-700">
        {{ doctor.lastName }} {{ doctor.firstName }}
        <span v-if="doctor.middleName">{{ doctor.middleName }}</span>
      </p>

      <p class="text-gray-500">Дата: {{ date }}</p>

      <p class="text-gray-500">
        Рабочее время кабинета:
        <b>{{ cabinet.workingHoursStart }}–{{ cabinet.workingHoursEnd }}</b>
      </p>

      <div class="space-y-4">
        <div class="flex gap-3">
          <input
            v-model="form.startTime"
            type="time"
            class="flex-1 px-4 py-3 border border-teal-400 rounded-lg"
          />
          <input
            v-model="form.endTime"
            type="time"
            class="flex-1 px-4 py-3 border border-teal-400 rounded-lg"
          />
        </div>
      </div>

      <div class="flex justify-between items-center">
        <button @click="emit('close')" class="px-4 py-2 bg-gray-300 rounded-lg">Отмена</button>

        <div class="flex gap-3">
          <button
            v-if="shift"
            @click="remove"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Удалить
          </button>

          <button
            @click="save"
            class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
