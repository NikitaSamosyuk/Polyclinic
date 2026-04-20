<template>
  <div class="doctors-page">
    <h1>Список врачей</h1>

    <div v-if="loading" class="loading">Загрузка...</div>

    <div v-else>
      <DoctorCard v-for="d in doctors" :key="d.id" :doctor="d" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DoctorCard from '../components/DoctorCard.vue'
import api from '../api/axios'

const doctors = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await api.get('/doctors')

    console.log('DOCTORS RESPONSE:', res.data)

    doctors.value = res.data
  } catch (err) {
    console.error('Ошибка загрузки врачей:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.doctors-page {
  padding: 20px;
}

.loading {
  font-size: 18px;
  color: #666;
}
</style>
