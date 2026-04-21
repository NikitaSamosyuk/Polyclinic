<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { appointmentsApi } from '../api/appointments'

const props = defineProps<{ user: any }>()

const appointments = ref([])

onMounted(async () => {
  appointments.value = await appointmentsApi.getAll()
})
</script>

<template>
  <div>
    <h2>Профиль администратора</h2>

    <p>Вы администратор. Здесь позже появятся настройки, управление пользователями и т.д.</p>

    <h3>Все записи</h3>
    <ul>
      <li v-for="a in appointments" :key="a.id">
        {{ a.date }} — {{ a.patient.lastName }} → {{ a.doctor.lastName }}
      </li>
    </ul>
  </div>
</template>
