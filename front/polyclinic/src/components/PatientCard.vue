<template>
  <div class="card">
    <h2>{{ patient.lastName }} {{ patient.firstName }}</h2>

    <p><strong>Дата рождения:</strong> {{ formatDate(patient.birthDate) }}</p>
    <p><strong>Телефон:</strong> {{ patient.phone }}</p>

    <h3>Адрес</h3>
    <p>
      {{ patient.region }},
      {{ patient.city }},
      {{ patient.street }} {{ patient.houseNumber }}
      <span v-if="patient.apartment">, кв. {{ patient.apartment }}</span>
    </p>

    <h3>Терапевт</h3>
    <p v-if="patient.primaryTherapist">
      {{ patient.primaryTherapist.lastName }}
      {{ patient.primaryTherapist.firstName }}
    </p>
    <p v-else>Не назначен</p>
  </div>
</template>

<script setup>
defineProps({
  patient: Object
})

function formatDate(date) {
  return new Date(date).toLocaleDateString('ru-RU')
}
</script>

<style scoped>
.card {
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
</style>
