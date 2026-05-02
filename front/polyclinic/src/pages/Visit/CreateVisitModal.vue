<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
    @click.self="close"
  >
    <div class="bg-white w-full max-w-xl rounded-xl shadow-xl flex flex-col overflow-hidden">
      <!-- Заголовок -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-2xl font-bold text-teal-800">Создание визита</h2>
      </div>

      <!-- Контент -->
      <div class="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-[15px]">
        <!-- Информация о записи -->
        <div class="bg-teal-50 border border-teal-200 rounded-lg p-4 space-y-1">
          <p><b>Дата:</b> {{ appointment.appointmentDate }}</p>
          <p><b>Время:</b> {{ appointment.startTime.slice(11, 16) }}</p>
          <p><b>Врач:</b> {{ appointment.doctor.lastName }} {{ appointment.doctor.firstName }}</p>
          <p>
            <b>Пациент:</b> {{ appointment.patient.lastName }} {{ appointment.patient.firstName }}
          </p>
        </div>

        <!-- Поля -->
        <textarea v-model="complaints" rows="2" placeholder="Жалобы" class="textarea"></textarea>

        <textarea v-model="diagnosis" rows="2" placeholder="Диагноз" class="textarea"></textarea>

        <textarea v-model="examination" rows="2" placeholder="Осмотр" class="textarea"></textarea>

        <textarea v-model="treatment" rows="2" placeholder="Лечение" class="textarea"></textarea>

        <textarea
          v-model="recommendations"
          rows="2"
          placeholder="Рекомендации"
          class="textarea"
        ></textarea>
      </div>

      <!-- Кнопки -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
        <button @click="close" class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
          Отмена
        </button>

        <button
          @click="submit"
          class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
        >
          Создать
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { createVisit } from '@/api/visits'

const props = defineProps({
  modelValue: Boolean,
  appointment: Object,
})

const emit = defineEmits(['update:modelValue', 'created'])

const complaints = ref('')
const diagnosis = ref('')
const examination = ref('')
const treatment = ref('')
const recommendations = ref('')

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      complaints.value = ''
      diagnosis.value = ''
      examination.value = ''
      treatment.value = ''
      recommendations.value = ''
    }
  }
)

function close() {
  emit('update:modelValue', false)
}

async function submit() {
  await createVisit({
    appointmentId: props.appointment.id,
    complaints: complaints.value,
    diagnosis: diagnosis.value,
    examination: examination.value,
    treatment: treatment.value,
    recommendations: recommendations.value,
  })

  emit('created')
  close()
}
</script>

<style scoped>
.textarea {
  font-size: 15px;
  padding: 8px;
  border: 1px solid #0d9488;
  border-radius: 6px;
  resize: none;
  width: 100%;
}
</style>
