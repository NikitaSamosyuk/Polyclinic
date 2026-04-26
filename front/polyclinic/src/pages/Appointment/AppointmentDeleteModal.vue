<script setup lang="ts">
import { deleteAppointment } from '@/api/appointments'

const props = defineProps<{
  modelValue: boolean
  appointment: any
}>()

const emit = defineEmits(['update:modelValue', 'deleted'])

function close() {
  emit('update:modelValue', false)
}

async function remove() {
  await deleteAppointment(props.appointment.id)
  emit('deleted')
  close()
}
</script>

<template>
  <div v-if="modelValue" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-5 w-full max-w-sm shadow-lg">
      <h3 class="text-lg font-bold mb-4">Удалить запись?</h3>

      <p class="mb-4">
        Вы уверены, что хотите удалить запись от
        <b>{{ new Date(appointment.appointmentDate).toLocaleDateString() }}</b
        >?
      </p>

      <div class="flex justify-between">
        <button class="px-3 py-1 bg-gray-200 rounded" @click="close">Отмена</button>

        <button class="px-4 py-1 bg-red-600 text-white rounded" @click="remove">Удалить</button>
      </div>
    </div>
  </div>
</template>
