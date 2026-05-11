<script setup lang="ts">
const props = defineProps<{
  appointment: any
  isAdmin: boolean
  isDoctor: boolean
  isPatient: boolean
}>()

const emit = defineEmits<{
  (e: 'delete', appt: any): void
  (e: 'open', appt: any): void
  (e: 'open-doctor', doctor: any): void
  (e: 'cancel', appt: any): void
  (e: 'create-visit', appt: any): void
}>()

function open() {
  emit('open', props.appointment)
}

function openDoctor(e: Event) {
  e.stopPropagation()
  emit('open-doctor', props.appointment.doctor)
}

function cancel(e: Event) {
  e.stopPropagation()
  emit('cancel', props.appointment)
}

function isFuture() {
  const start = new Date(props.appointment.startTime).getTime()
  return start > Date.now()
}
</script>

<template>
  <div
    class="relative bg-white border border-teal-300 rounded-xl shadow-md p-6 flex flex-col gap-5 hover:shadow-lg transition cursor-pointer"
    @click="open"
  >
    <!-- ❌ КРЕСТИК (удалить запись — только админ/врач, только если нет визита) -->
    <button
      v-if="(isAdmin || isDoctor) && !appointment.visit"
      @click.stop="emit('delete', appointment)"
      class="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 transition"
      title="Удалить запись"
    >
      <img src="@/assets/cancel.png" class="w-5 h-5 opacity-80 hover:opacity-100" />
    </button>

    <!-- ❌ КРЕСТИК (отменить запись — только пациент, только будущие) -->
    <button
      v-if="isPatient && isFuture()"
      @click="cancel"
      class="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 transition"
      title="Отказаться от записи"
    >
      <img src="@/assets/cancel.png" class="w-5 h-5 opacity-80 hover:opacity-100" />
    </button>

    <!-- Дата и время -->
    <div class="pb-3 border-b border-gray-200">
      <h2 class="text-2xl font-bold text-teal-800">
        {{ new Date(appointment.appointmentDate).toLocaleDateString('ru-RU') }}
      </h2>
      <p class="text-gray-600 text-sm">
        {{ appointment.startTime.slice(11, 16) }} — {{ appointment.endTime.slice(11, 16) }}
      </p>
    </div>

    <!-- Врач -->
    <div class="flex items-start gap-3">
      <img src="@/assets/doctor-icon.png" class="w-7 h-7" />

      <div class="flex-1 flex flex-col gap-1">
        <div class="flex items-center justify-between gap-3">
          <p class="font-semibold text-lg text-gray-900 leading-tight">
            {{ appointment.doctor.lastName }}
            {{ appointment.doctor.firstName }}
            <span v-if="appointment.doctor.middleName">
              {{ appointment.doctor.middleName }}
            </span>
          </p>

          <div class="flex items-center gap-2">
            <!-- Открыть врача -->
            <button
              @click.stop="openDoctor"
              class="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow"
            >
              Открыть
            </button>

            <!-- 🔥 Создать визит -->
            <button
              v-if="(isDoctor || isAdmin) && !appointment.visit"
              @click.stop="emit('create-visit', appointment)"
              class="px-3 py-1 text-xs bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow"
            >
              Создать визит
            </button>
          </div>
        </div>

        <p class="text-sm text-gray-600">
          {{ appointment.doctor.specialization }}
        </p>
      </div>
    </div>

    <!-- Пациент -->
    <div v-if="isAdmin || isDoctor" class="flex items-start gap-3">
      <img src="@/assets/patient-icon.png" class="w-7 h-7" />

      <p class="font-semibold text-lg text-gray-900 leading-tight">
        {{ appointment.patient.lastName }}
        {{ appointment.patient.firstName }}
        <span v-if="appointment.patient.middleName">
          {{ appointment.patient.middleName }}
        </span>
      </p>
    </div>

    <!-- Кабинет -->
    <div class="flex items-start gap-3">
      <img src="@/assets/cabinet-icon.png" class="w-7 h-7" />
      <p class="font-medium text-lg text-gray-900">Кабинет №{{ appointment.cabinet.number }}</p>
    </div>

    <!-- Причина -->
    <div
      v-if="appointment.reason"
      class="bg-teal-50 border border-teal-200 rounded-lg p-4 shadow-sm"
    >
      <p class="text-sm text-gray-700"><b>Причина визита:</b> {{ appointment.reason }}</p>
    </div>
  </div>
</template>
