<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  appointment: any
}>()

const emit = defineEmits(['update:modelValue'])

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <div v-if="modelValue" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-5 w-full max-w-md shadow-lg">
      <h3 class="text-xl font-bold mb-4">Информация о записи</h3>

      <p><b>Врач:</b> {{ appointment.doctor.lastName }} {{ appointment.doctor.firstName }}</p>
      <p><b>Специализация:</b> {{ appointment.doctor.specialization }}</p>
      <p><b>Дата:</b> {{ new Date(appointment.appointmentDate).toLocaleDateString() }}</p>
      <p><b>Время:</b> {{ appointment.startTime.slice(11, 16) }}</p>
      <p><b>Кабинет:</b> №{{ appointment.cabinet.number }}</p>

      <button class="mt-4 px-3 py-1 bg-gray-300 rounded" @click="close">Закрыть</button>
    </div>
  </div>
</template>
