<script setup lang="ts">
import { doctorsApi } from '@/api/doctors'

const props = defineProps<{
  doctor: any
}>()

const emit = defineEmits(['close', 'updated'])

async function activate() {
  await doctorsApi.activate(props.doctor.id)
  emit('updated')
  emit('close')
}
</script>

<template>
  <div
    class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
    @click.self="emit('close')"
  >
    <div class="bg-white w-full max-w-md rounded-xl shadow-xl p-8 space-y-6">
      <h2 class="text-2xl font-bold text-green-700">Активировать врача?</h2>

      <p class="text-gray-700">
        Вы уверены, что хотите активировать врача
        <b>{{ doctor.lastName }} {{ doctor.firstName }}</b
        >?
      </p>

      <div class="flex justify-end gap-3">
        <button class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300" @click="emit('close')">
          Отмена
        </button>

        <button
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          @click="activate"
        >
          Активировать
        </button>
      </div>
    </div>
  </div>
</template>
