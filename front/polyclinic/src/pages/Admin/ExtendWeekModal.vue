<template>
  <div v-if="show" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-md space-y-6">
      <h2 class="text-2xl font-bold text-teal-800">Продлить расписание на неделю?</h2>

      <p class="text-gray-700">
        Будут скопированы смены врача за последнюю неделю и перенесены на следующую.
      </p>

      <div class="flex justify-end gap-3">
        <button @click="$emit('close')" class="px-4 py-2 bg-gray-300 rounded-lg">Отмена</button>

        <button
          @click="extend"
          class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
        >
          Продлить
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import api from '@/api/axios'

const props = defineProps<{
  show: boolean
  doctorId: number
}>()

const emit = defineEmits(['close', 'updated'])

async function extend() {
  await api.post(`/shifts/extend-week/${props.doctorId}`)
  emit('updated')
  emit('close')
}
</script>
