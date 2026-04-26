<template>
  <div class="fixed inset-0 bg-black/40 flex justify-center items-center">
    <div class="bg-white p-6 rounded-xl w-[380px] shadow-lg">
      <h2 class="text-xl font-semibold mb-4">Деактивация врача</h2>

      <p class="text-gray-700 mb-6">
        Вы уверены, что хотите деактивировать врача
        <b>{{ doctor.lastName }} {{ doctor.firstName }}</b
        >?
      </p>

      <div class="flex gap-3">
        <button
          class="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
          @click="$emit('confirm')"
        >
          Деактивировать
        </button>

        <button
          class="flex-1 bg-gray-300 py-2 rounded-lg hover:bg-gray-400"
          @click="$emit('close')"
        >
          Отмена
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ doctor: any }>()
defineEmits(['close', 'confirm'])
</script>
