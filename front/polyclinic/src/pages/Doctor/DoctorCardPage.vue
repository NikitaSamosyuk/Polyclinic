<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { doctorsApi } from '@/api/doctors'
import DoctorCard from '@/components/DoctorCard.vue'

const route = useRoute()
const doctor = ref(null)
const loading = ref(true)
const error = ref(null)

async function load() {
  try {
    const id = Number(route.params.id)
    const res = await doctorsApi.getById(id)
    doctor.value = res
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Ошибка загрузки врача'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="max-w-3xl mx-auto p-6">
    <div v-if="loading" class="text-gray-600 text-lg">Загрузка...</div>
    <div v-else-if="error" class="text-red-600 text-lg">{{ error }}</div>

    <DoctorCard v-else :doctor="doctor" />
  </div>
</template>
