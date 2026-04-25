<script setup lang="ts">
import { ref, watch } from 'vue'
import { createCabinet, updateCabinet } from '@/api/cabinets'

const props = defineProps<{
  modelValue: boolean
  cabinet: any | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'saved'): void
}>()

// --- Локальные поля ---
const number = ref('')
const specialization = ref('')
const workingHoursStart = ref('08:00')
const workingHoursEnd = ref('16:00')
const slotDuration = ref(30)
const isActive = ref(true)

const loading = ref(false)
const error = ref<string | null>(null)

watch(
  () => props.modelValue,
  (v) => {
    if (!v) return
    error.value = null

    if (props.cabinet) {
      number.value = props.cabinet.number
      specialization.value = props.cabinet.specialization
      workingHoursStart.value = props.cabinet.workingHoursStart
      workingHoursEnd.value = props.cabinet.workingHoursEnd
      slotDuration.value = props.cabinet.slotDuration
      isActive.value = props.cabinet.isActive
    } else {
      number.value = ''
      specialization.value = ''
      workingHoursStart.value = '08:00'
      workingHoursEnd.value = '16:00'
      slotDuration.value = 30
      isActive.value = true
    }
  },
  { immediate: true }
)

const isEdit = computed(() => !!props.cabinet)

function close() {
  emit('update:modelValue', false)
}

async function save() {
  loading.value = true
  error.value = null

  try {
    if (isEdit.value) {
      await updateCabinet(props.cabinet.id, {
        number: number.value,
        specialization: specialization.value,
        workingHoursStart: workingHoursStart.value,
        workingHoursEnd: workingHoursEnd.value,
        slotDuration: slotDuration.value,
        isActive: isActive.value,
      })
    } else {
      await createCabinet({
        number: number.value,
        specialization: specialization.value,
        workingHoursStart: workingHoursStart.value,
        workingHoursEnd: workingHoursEnd.value,
        slotDuration: slotDuration.value,
      })
    }

    emit('saved')
    close()
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Ошибка сохранения'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div v-if="modelValue" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg p-5 w-full max-w-lg">
      <h3 class="text-lg font-semibold mb-4">
        {{ isEdit ? 'Редактировать кабинет' : 'Создать кабинет' }}
      </h3>

      <div class="space-y-4">
        <div>
          <label class="block text-sm mb-1">Номер кабинета</label>
          <input
            v-model="number"
            type="text"
            class="border rounded px-2 py-1 w-full"
            placeholder="101"
          />
        </div>

        <div>
          <label class="block text-sm mb-1">Специализация</label>
          <input
            v-model="specialization"
            type="text"
            class="border rounded px-2 py-1 w-full"
            placeholder="Комбинированный"
          />
        </div>

        <div class="flex gap-3">
          <div class="flex-1">
            <label class="block text-sm mb-1">Начало работы</label>
            <input
              v-model="workingHoursStart"
              type="time"
              class="border rounded px-2 py-1 w-full"
            />
          </div>

          <div class="flex-1">
            <label class="block text-sm mb-1">Окончание работы</label>
            <input v-model="workingHoursEnd" type="time" class="border rounded px-2 py-1 w-full" />
          </div>
        </div>

        <div>
          <label class="block text-sm mb-1">Длительность слота (мин)</label>
          <input
            v-model.number="slotDuration"
            type="number"
            min="5"
            class="border rounded px-2 py-1 w-full"
          />
        </div>

        <div v-if="isEdit" class="flex items-center gap-2">
          <input v-model="isActive" type="checkbox" id="active" />
          <label for="active" class="text-sm">Кабинет активен</label>
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      </div>

      <div class="mt-5 flex justify-between">
        <button
          class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          @click="close"
          :disabled="loading"
        >
          Отмена
        </button>

        <button
          class="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          @click="save"
          :disabled="loading"
        >
          {{ isEdit ? 'Сохранить' : 'Создать' }}
        </button>
      </div>
    </div>
  </div>
</template>
