<script setup>
import { ref, onMounted } from 'vue'
import api from '../api/axios'

const cabinets = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await api.get('/cabinets')
    cabinets.value = res.data
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="page">
    <h1>Кабинеты</h1>

    <div v-if="loading">Загрузка...</div>

    <div v-else>
      <div v-for="cab in cabinets" :key="cab.id" class="cabinet-card">
        <h2>Кабинет №{{ cab.number }}</h2>

        <p><strong>Специализация:</strong> {{ cab.specialization }}</p>
        <p><strong>Этаж:</strong> {{ cab.floor ?? '—' }}</p>
        <p>
          <strong>Время работы:</strong> {{ cab.workingHoursStart }} — {{ cab.workingHoursEnd }}
        </p>
        <p><strong>Длительность слота:</strong> {{ cab.slotDuration }} мин</p>

        <h3>Врачи</h3>
        <ul>
          <li v-for="doc in cab.doctors" :key="doc.id">
            {{ doc.lastName }} {{ doc.firstName }} {{ doc.middleName || '' }} —
            {{ doc.specialization }}
          </li>
        </ul>

        <h3>Смены</h3>
        <ul>
          <li v-for="shift in cab.shifts" :key="shift.id">
            {{ shift.date }}: {{ shift.startTime }} — {{ shift.endTime }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding: 20px;
}

.cabinet-card {
  border: 1px solid #ddd;
  padding: 16px;
  margin-bottom: 20px;
  border-radius: 8px;
}
</style>
