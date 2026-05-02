<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  appointment: any
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', appt: any): void
}>()

function close() {
  emit('update:modelValue', false)
}

function confirmCancel() {
  emit('confirm', props.appointment)
}
</script>

<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative border border-red-300">
      <!-- Кнопка закрытия -->
      <button
        @click="close"
        class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
      >
        ✕
      </button>

      <!-- Шапка -->
      <div class="text-center mb-6">
        <h2 class="text-lg font-bold text-gray-700">Городская поликлиника №165</h2>
        <p class="text-sm text-gray-500 -mt-1">Минск</p>
      </div>

      <!-- Иконка -->
      <div class="flex justify-center mb-4">
        <img src="@/assets/cancel.png" class="w-16 h-16 opacity-80" />
      </div>

      <h3 class="text-2xl font-bold text-red-700 text-center mb-4">Отменить запись?</h3>

      <div class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
        <p class="text-gray-800 text-sm">
          <b>Врач:</b>
          {{ appointment.doctor.lastName }}
          {{ appointment.doctor.firstName }}
          <span v-if="appointment.doctor.middleName">
            {{ appointment.doctor.middleName }}
          </span>
        </p>

        <p class="text-gray-800 text-sm">
          <b>Дата:</b>
          {{ new Date(appointment.appointmentDate).toLocaleDateString('ru-RU') }}
        </p>

        <p class="text-gray-800 text-sm">
          <b>Время:</b>
          {{ appointment.startTime.slice(11, 16) }}
        </p>

        <p class="text-gray-800 text-sm"><b>Кабинет:</b> №{{ appointment.cabinet.number }}</p>
      </div>

      <div class="flex justify-between gap-4 mt-6">
        <button
          @click="close"
          class="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg shadow hover:bg-gray-400 transition"
        >
          Закрыть
        </button>

        <button
          @click="confirmCancel"
          class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
        >
          Отменить запись
        </button>
      </div>
    </div>
  </div>
</template>
