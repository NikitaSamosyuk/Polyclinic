<template>
  <div class="bg-white shadow-md rounded-xl p-6">
    <h2 class="text-xl font-semibold mb-4">Профиль пациента</h2>

    <p>
      <strong>ФИО:</strong>
      {{ patient.lastName }} {{ patient.firstName }}
      <span v-if="patient.middleName"> {{ patient.middleName }}</span>
    </p>

    <p><strong>Дата рождения:</strong> {{ format(patient.birthDate) }}</p>
    <p><strong>Телефон:</strong> {{ patient.phone }}</p>

    <h3 class="mt-4 font-semibold">Адрес</h3>
    <p>
      {{ patient.region }}, {{ patient.city }}, {{ patient.street }} {{ patient.houseNumber }}
      <span v-if="patient.apartment">, кв. {{ patient.apartment }}</span>
    </p>

    <h3 class="mt-4 font-semibold flex items-center gap-2">
      Терапевт

      <button
        v-if="patient.primaryTherapist"
        @click="openDoctor"
        class="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Открыть
      </button>
    </h3>

    <p v-if="patient.primaryTherapist">
      {{ patient.primaryTherapist.lastName }}
      {{ patient.primaryTherapist.firstName }}
      <span v-if="patient.primaryTherapist.middleName">
        {{ patient.primaryTherapist.middleName }}
      </span>
    </p>

    <p v-else>Не назначен</p>

    <button
      class="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
      @click="isEditing = true"
    >
      Изменить профиль
    </button>

    <EditPatientProfile
      v-if="isEditing"
      :patient="patient"
      @close="isEditing = false"
      @updated="onUpdated"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import EditPatientProfile from '@/pages/Patient/EditPatientProfile.vue'

const props = defineProps({
  patient: { type: Object, required: true },
})

const router = useRouter()
const isEditing = ref(false)

function format(date) {
  return new Date(date).toLocaleDateString('ru-RU')
}

function onUpdated(updated) {
  Object.assign(props.patient, updated)
  isEditing.value = false
}

function openDoctor() {
  router.push(`/doctors/${props.patient.primaryTherapist.id}`)
}
</script>
