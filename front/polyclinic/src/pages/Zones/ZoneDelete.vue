<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center">
    <div class="bg-white p-6 rounded-xl w-[360px] shadow">
      <h2 class="text-xl font-semibold mb-4">Удалить зону?</h2>

      <p class="text-gray-700 mb-4">
        Удалить зону по улице <b>{{ zone.street }}</b
        >?
      </p>

      <div class="flex gap-3">
        <button @click="confirm" class="flex-1 bg-red-600 text-white py-2 rounded-lg">
          Удалить
        </button>

        <button @click="$emit('close')" class="flex-1 bg-gray-300 py-2 rounded-lg">Отмена</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import api from '@/api/axios'

const props = defineProps({ zone: Object })
const emit = defineEmits(['close', 'deleted'])

async function confirm() {
  await api.delete(`/therapist-zones/${props.zone.id}`)
  emit('deleted', props.zone.id)
}
</script>
