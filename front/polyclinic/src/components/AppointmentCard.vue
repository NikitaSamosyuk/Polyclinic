<script setup lang="ts">
const props = defineProps<{
  appointment: any
  isAdmin: boolean
  isDoctor: boolean
  isPatient: boolean
}>()

const emit = defineEmits<{
  (e: 'edit', appt: any): void
  (e: 'delete', appt: any): void
  (e: 'open', appt: any): void
  (e: 'open-doctor', doctor: any): void
}>()

function open() {
  emit('open', props.appointment)
}

function openDoctor(e: Event) {
  e.stopPropagation()
  emit('open-doctor', props.appointment.doctor)
}
</script>

<template>
  <div
    class="border rounded-xl shadow bg-white overflow-hidden cursor-pointer hover:shadow-lg transition"
    @click="open"
  >
    <!-- Шапка талона -->
    <div class="bg-blue-700 text-white px-4 py-3 flex justify-between items-center">
      <span class="font-semibold text-lg">
        {{ new Date(appointment.appointmentDate).toLocaleDateString('ru-RU') }}
      </span>

      <span class="font-semibold text-lg">
        {{ appointment.startTime.slice(11, 16) }}–{{ appointment.endTime.slice(11, 16) }}
      </span>
    </div>

    <!-- Контент -->
    <div class="p-4 space-y-4 text-gray-900">
      <!-- Врач -->
      <div class="flex justify-between items-start">
        <div class="flex items-start gap-2">
          <span class="text-xl">👨‍⚕️</span>
          <div>
            <p class="font-semibold text-base leading-tight">
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

        <!-- Кнопка "Открыть врача" -->
        <button
          class="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
          @click="openDoctor"
        >
          Открыть
        </button>
      </div>

      <!-- Пациент -->
      <div v-if="isAdmin || isDoctor" class="flex items-start gap-2">
        <span class="text-xl">🧍</span>
        <p class="font-medium leading-tight">
          {{ appointment.patient.lastName }}
          {{ appointment.patient.firstName }}
          <span v-if="appointment.patient.middleName">
            {{ appointment.patient.middleName }}
          </span>
        </p>
      </div>

      <!-- Кабинет -->
      <div class="flex items-center gap-2">
        <span class="text-xl">🏥</span>
        <p class="font-medium">Кабинет №{{ appointment.cabinet.number }}</p>
      </div>
    </div>

    <!-- Кнопки админа -->
    <div v-if="isAdmin" class="px-4 py-2 border-t flex gap-3 bg-gray-50" @click.stop>
      <button
        class="px-3 py-1 bg-blue-600 text-white rounded text-sm"
        @click="emit('edit', appointment)"
      >
        Редактировать
      </button>

      <button
        class="px-3 py-1 bg-red-600 text-white rounded text-sm"
        @click="emit('delete', appointment)"
      >
        Удалить
      </button>
    </div>
  </div>
</template>
