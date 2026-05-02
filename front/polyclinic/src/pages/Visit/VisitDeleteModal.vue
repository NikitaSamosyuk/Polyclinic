<script setup lang="ts">
const props = defineProps<{
  open: boolean
  visit: any | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm', visit: any): void
}>()
</script>

<template>
  <div
    v-if="open && visit"
    class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
    @click.self="emit('close')"
  >
    <div class="bg-white w-full max-w-md rounded-xl shadow-xl p-8">
      <!-- Заголовок -->
      <h2 class="text-2xl font-bold text-red-600 mb-4">Удалить визит?</h2>

      <!-- Текст -->
      <p class="text-gray-700 mb-6 leading-relaxed">
        Вы действительно хотите удалить визит от
        <b>{{ visit.visitDatetime.slice(0, 10).split('-').reverse().join('.') }}</b
        >?
      </p>

      <!-- Кнопки -->
      <div class="flex justify-end gap-3">
        <button
          class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          @click="emit('close')"
        >
          Отмена
        </button>

        <button
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          @click="emit('confirm', visit)"
        >
          Удалить
        </button>
      </div>
    </div>
  </div>
</template>
