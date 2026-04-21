<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { appointmentsApi } from '../api/appointments'
import AppointmentCard from '../components/AppointmentCard.vue'

const list = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await appointmentsApi.getMyAppointments()
    list.value = Array.isArray(res) ? res : []
  } catch (err) {
    console.error('Error loading my appointments', err)
    list.value = []
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="page">
    <h2>Мои записи</h2>

    <div v-if="loading" class="loading">Загрузка…</div>

    <div v-else-if="list.length === 0" class="empty">Нет записей</div>

    <div v-else class="list">
      <AppointmentCard v-for="a in list" :key="a.id" :appointment="a" />
    </div>
  </div>
</template>

<style scoped>
.page {
  padding: 10px;
}

.loading {
  color: #2b6cb0;
}

.empty {
  color: #666;
}

.list {
  margin-top: 12px;
}
</style>
