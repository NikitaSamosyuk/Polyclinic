<script setup lang="ts">
import { ref } from 'vue'
import { patientsApi } from '@/api/patients'

const props = defineProps({
  patient: Object,
})

const emit = defineEmits(['close', 'updated'])

const loading = ref(false)
const error = ref<string | null>(null)

async function confirm() {
  try {
    loading.value = true
    error.value = null
    await patientsApi.deactivate(props.patient.id)
    emit('updated')
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Ошибка деактивации'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border border-teal-300">
      <h2 class="text-xl font-bold mb-4 text-teal-800">Деактивировать пациента?</h2>

      <p class="text-gray-700 mb-4">
        Вы уверены, что хотите деактивировать
        <b>{{ patient.lastName }} {{ patient.firstName }}</b
        >?
      </p>

      <p v-if="error" class="text-red-600 mb-3">{{ error }}</p>

      <div class="flex justify-end gap-3 mt-4">
        <button class="px-4 py-2 bg-gray-300 rounded" @click="emit('close')" :disabled="loading">
          Отмена
        </button>
        <button
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          @click="confirm"
          :disabled="loading"
        >
          Деактивировать
        </button>
      </div>
    </div>
  </div>
</template>
