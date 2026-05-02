<template>
  <div class="bg-white border border-teal-300 rounded-xl shadow p-6 space-y-5">
    <!-- Заголовок -->
    <h2 class="text-2xl font-bold text-teal-800 mb-4">Профиль пациента</h2>

    <!-- ФИО -->
    <div class="space-y-1 text-gray-800">
      <p>
        <b>ФИО:</b>
        {{ patient.lastName }} {{ patient.firstName }}
        <span v-if="patient.middleName"> {{ patient.middleName }}</span>
      </p>

      <p><b>Дата рождения:</b> {{ format(patient.birthDate) }}</p>
      <p><b>Телефон:</b> {{ patient.phone }}</p>
    </div>

    <!-- Терапевт -->
    <div class="pt-4 border-t border-gray-200">
      <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-3">
        Терапевт

        <button
          v-if="patient.primaryTherapist"
          @click="showDoctor = true"
          class="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow"
        >
          Открыть
        </button>
      </h3>

      <p v-if="patient.primaryTherapist" class="mt-1 text-gray-800">
        {{ patient.primaryTherapist.lastName }}
        {{ patient.primaryTherapist.firstName }}
        <span v-if="patient.primaryTherapist.middleName">
          {{ patient.primaryTherapist.middleName }}
        </span>
      </p>

      <p v-else class="text-gray-500 mt-1">Не назначен</p>
    </div>

    <!-- Кнопка редактирования -->
    <button
      class="w-full mt-4 bg-green-600 text-white py-2 rounded-lg shadow hover:bg-green-700 transition"
      @click="isEditing = true"
    >
      Изменить профиль
    </button>

    <!-- Модалка редактирования -->
    <EditPatientProfile
      v-if="isEditing"
      :patient="patient"
      @close="isEditing = false"
      @updated="onUpdated"
    />

    <!-- Модалка врача -->
    <DoctorModal
      v-if="showDoctor"
      :doctor-id="patient.primaryTherapist.id"
      :show="showDoctor"
      @close="showDoctor = false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import EditPatientProfile from '@/pages/Patient/EditPatientProfile.vue'
import DoctorModal from '@/components/DoctorModal.vue'

const props = defineProps({
  patient: { type: Object, required: true },
})

const isEditing = ref(false)
const showDoctor = ref(false)

function format(date) {
  return new Date(date).toLocaleDateString('ru-RU')
}

function onUpdated(updated) {
  Object.assign(props.patient, updated)
  isEditing.value = false
}
</script>
