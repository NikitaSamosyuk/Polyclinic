<script setup lang="ts">
import { ref } from 'vue'
import { createCabinet } from '@/api/cabinets'

const props = defineProps({
  show: Boolean,
})

const emit = defineEmits(['close', 'created'])

const form = ref({
  number: '',
  floor: null,
  specialization: 'Комбинированный',
  workingHoursStart: '08:00',
  workingHoursEnd: '16:00',
  slotDuration: 15,
})

async function save() {
  const created = await createCabinet({
    number: form.value.number,
    floor: form.value.floor,
    specialization: form.value.specialization,
    workingHoursStart: form.value.workingHoursStart,
    workingHoursEnd: form.value.workingHoursEnd,
    slotDuration: Number(form.value.slotDuration),
  })

  emit('created', created)
  emit('close')
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg border border-teal-300 space-y-6">
      <h2 class="text-2xl font-bold text-teal-800">Создать кабинет</h2>

      <div class="space-y-4">
        <input
          v-model="form.number"
          class="w-full px-4 py-3 border border-teal-400 rounded-lg"
          placeholder="Номер кабинета"
        />

        <input
          v-model="form.floor"
          type="number"
          class="w-full px-4 py-3 border border-teal-400 rounded-lg"
          placeholder="Этаж"
        />

        <input
          v-model="form.specialization"
          class="w-full px-4 py-3 border border-teal-400 rounded-lg"
          placeholder="Специализация"
        />

        <div class="flex gap-3">
          <input
            v-model="form.workingHoursStart"
            type="time"
            class="flex-1 px-4 py-3 border border-teal-400 rounded-lg"
          />
          <input
            v-model="form.workingHoursEnd"
            type="time"
            class="flex-1 px-4 py-3 border border-teal-400 rounded-lg"
          />
        </div>

        <input
          v-model="form.slotDuration"
          type="number"
          class="w-full px-4 py-3 border border-teal-400 rounded-lg"
          placeholder="Длительность слота"
        />
      </div>

      <div class="flex justify-end gap-3">
        <button @click="emit('close')" class="px-4 py-2 bg-gray-300 rounded-lg">Отмена</button>
        <button @click="save" class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
          Создать
        </button>
      </div>
    </div>
  </div>
</template>
