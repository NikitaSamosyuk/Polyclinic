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
    <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-xl border border-gray-200">
      <h3 class="text-xl font-bold mb-4 text-center">Талон на приём</h3>

      <div class="space-y-2 text-gray-900">
        <p>
          <b>Пациент:</b>
          {{ appointment.patient.lastName }}
          {{ appointment.patient.firstName }}
          <span v-if="appointment.patient.middleName">
            {{ appointment.patient.middleName }}
          </span>
        </p>

        <p>
          <b>Дата:</b>
          {{ new Date(appointment.appointmentDate).toLocaleDateString('ru-RU') }}
        </p>

        <p>
          <b>Время:</b>
          {{ appointment.startTime.slice(11, 16) }}
        </p>

        <p>
          <b>Кабинет:</b>
          №{{ appointment.cabinet.number }}
        </p>
      </div>

      <button
        class="mt-5 w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        @click="close"
      >
        Закрыть
      </button>
    </div>
  </div>
</template>
