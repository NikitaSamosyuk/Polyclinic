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
      {{ patient.region }}, {{ patient.city }},
      {{ patient.street }} {{ patient.houseNumber }}
      <span v-if="patient.apartment">, кв. {{ patient.apartment }}</span>
    </p>

    <h3 class="mt-4 font-semibold">Терапевт</h3>
    <p v-if="patient.primaryTherapist">
      {{ patient.primaryTherapist.lastName }}
      {{ patient.primaryTherapist.firstName }}
    </p>
    <p v-else>Не назначен</p>
  </div>
</template>

<script setup>
defineProps({
  patient: {
    type: Object,
    required: true
  }
})

function format(date) {
  return new Date(date).toLocaleDateString('ru-RU')
}
</script>
