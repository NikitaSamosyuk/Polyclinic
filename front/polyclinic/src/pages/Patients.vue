<template>
  <div class="patients-page">
    <h1>Список пациентов</h1>

    <div v-if="loading" class="loading">Загрузка...</div>

    <div v-else>
      <PatientCard v-for="p in patients" :key="p.id" :patient="p" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PatientCard from '../components/PatientCard.vue'
import api from '../api/axios'

const patients = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await api.get('/patients')
    patients.value = res.data
  } catch (err) {
    console.error('Ошибка загрузки пациентов:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.patients-page {
  padding: 20px;
}

.loading {
  font-size: 18px;
  color: #666;
}
</style>
