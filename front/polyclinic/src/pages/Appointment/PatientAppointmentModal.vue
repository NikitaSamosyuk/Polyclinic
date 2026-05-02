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
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative border border-teal-300">
      <!-- Кнопка закрытия -->
      <button
        @click="close"
        class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
      >
        ✕
      </button>

      <!-- Шапка поликлиники -->
      <div class="text-center mb-6">
        <h2 class="text-lg font-bold text-gray-700">Городская поликлиника №165</h2>
        <p class="text-sm text-gray-500 -mt-1">Минск</p>
      </div>

      <!-- Заголовок -->
      <h3 class="text-2xl font-bold text-teal-800 mb-6 text-center">Информация о записи</h3>

      <!-- Контент -->
      <div class="space-y-5 text-gray-800">
        <!-- Врач -->
        <div class="flex items-start gap-4">
          <img src="@/assets/doctor-icon.png" alt="doctor icon" class="w-9 h-9 object-contain" />
          <div>
            <p class="font-semibold text-lg leading-tight">
              {{ appointment.doctor.lastName }}
              {{ appointment.doctor.firstName }}
              <span v-if="appointment.doctor.middleName">
                {{ appointment.doctor.middleName }}
              </span>
            </p>
            <p class="text-sm text-gray-600">
              {{ appointment.doctor.specialization }}
            </p>
          </div>
        </div>

        <!-- Дата -->
        <div class="flex items-center gap-4">
          <img
            src="@/assets/calendar-icon.png"
            alt="calendar icon"
            class="w-8 h-8 object-contain"
          />
          <p class="text-base">
            <b>Дата:</b>
            {{ new Date(appointment.appointmentDate).toLocaleDateString('ru-RU') }}
          </p>
        </div>

        <!-- Время -->
        <div class="flex items-center gap-4">
          <img src="@/assets/time-icon.png" alt="time icon" class="w-8 h-8 object-contain" />
          <p class="text-base">
            <b>Время:</b>
            {{ appointment.startTime.slice(11, 16) }}
          </p>
        </div>

        <!-- Кабинет -->
        <div class="flex items-center gap-4">
          <img src="@/assets/cabinet-icon.png" alt="cabinet icon" class="w-8 h-8 object-contain" />
          <p class="text-base"><b>Кабинет:</b> №{{ appointment.cabinet.number }}</p>
        </div>

        <!-- Причина -->
        <div
          v-if="appointment.reason"
          class="bg-teal-50 border border-teal-200 rounded-lg p-4 shadow-sm"
        >
          <p class="text-sm text-gray-700 leading-snug">
            <b>Причина визита:</b> {{ appointment.reason }}
          </p>
        </div>
      </div>

      <!-- Кнопка закрытия снизу -->
      <div class="mt-8 flex justify-end">
        <button
          @click="close"
          class="px-6 py-2 bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700 transition"
        >
          Закрыть
        </button>
      </div>
    </div>
  </div>
</template>
