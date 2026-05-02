<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  open: boolean
  visit: any | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', dto: any): void
}>()

const complaints = ref('')
const diagnosis = ref('')
const examination = ref('')
const treatment = ref('')
const recommendations = ref('')

watch(
  () => props.visit,
  (v) => {
    if (!v) return
    complaints.value = v.complaints || ''
    diagnosis.value = v.diagnosis || ''
    examination.value = v.examination || ''
    treatment.value = v.treatment || ''
    recommendations.value = v.recommendations || ''
  },
  { immediate: true }
)
</script>

<template>
  <div
    v-if="open && visit"
    class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
    @click.self="emit('close')"
  >
    <div class="bg-white w-full max-w-xl rounded-xl shadow-xl p-8">
      <!-- Заголовок -->
      <h2 class="text-2xl font-bold text-teal-800 mb-6">Редактировать визит</h2>

      <!-- Поля -->
      <div class="flex flex-col gap-4 text-[15px]">
        <textarea v-model="complaints" class="textarea" rows="2" placeholder="Жалобы" />

        <textarea v-model="diagnosis" class="textarea" rows="2" placeholder="Диагноз" />

        <textarea v-model="examination" class="textarea" rows="2" placeholder="Осмотр" />

        <textarea v-model="treatment" class="textarea" rows="2" placeholder="Лечение" />

        <textarea v-model="recommendations" class="textarea" rows="2" placeholder="Рекомендации" />
      </div>

      <!-- Кнопки -->
      <div class="flex justify-end gap-3 mt-6">
        <button
          class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          @click="emit('close')"
        >
          Отмена
        </button>

        <button
          class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
          @click="
            emit('save', {
              complaints: complaints.value,
              diagnosis: diagnosis.value,
              examination: examination.value,
              treatment: treatment.value,
              recommendations: recommendations.value,
            })
          "
        >
          Сохранить
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #0d9488;
  border-radius: 8px;
  resize: none;
  font-size: 15px;
}
</style>
