<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { createShift, updateShift, deleteShift } from '@/api/shifts'

const props = defineProps<{
  modelValue: boolean
  doctor: any | null
  cabinetId: number | null
  shift: any | null
  date: string | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'saved'): void
}>()

const localDate = ref('')
const startTime = ref('08:00')
const endTime = ref('12:00')
const loading = ref(false)
const error = ref<string | null>(null)

watch(
  () => props.modelValue,
  (v) => {
    if (!v) return
    error.value = null

    if (props.shift) {
      localDate.value = props.shift.date.toString().slice(0, 10)
      startTime.value = props.shift.startTime
      endTime.value = props.shift.endTime
    } else {
      localDate.value = props.date || new Date().toISOString().split('T')[0]
      startTime.value = '08:00'
      endTime.value = '12:00'
    }
  },
  { immediate: true }
)

const isEdit = computed(() => !!props.shift)

function close() {
  emit('update:modelValue', false)
}

async function save() {
  if (!props.doctor || !props.cabinetId || !localDate.value) return
  loading.value = true
  error.value = null

  try {
    if (props.shift) {
      await updateShift(props.shift.id, {
        date: localDate.value,
        startTime: startTime.value,
        endTime: endTime.value,
      })
    } else {
      await createShift({
        doctorId: props.doctor.id,
        cabinetId: props.cabinetId,
        date: localDate.value,
        startTime: startTime.value,
        endTime: endTime.value,
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

async function remove() {
  if (!props.shift) return
  loading.value = true
  error.value = null

  try {
    await deleteShift(props.shift.id)
    emit('saved')
    close()
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Ошибка удаления'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div v-if="modelValue" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg p-4 w-full max-w-md">
      <h3 class="text-lg font-semibold mb-3">
        {{ isEdit ? 'Редактировать смену' : 'Создать смену' }}
      </h3>

      <p class="text-sm text-gray-600 mb-2" v-if="doctor">
        Врач: <b>{{ doctor.lastName }} {{ doctor.firstName }}</b>
      </p>

      <div class="space-y-3">
        <div>
          <label class="block text-sm mb-1">Дата</label>
          <input v-model="localDate" type="date" class="border rounded px-2 py-1 w-full" />
        </div>

        <div class="flex gap-2">
          <div class="flex-1">
            <label class="block text-sm mb-1">Начало</label>
            <input v-model="startTime" type="time" class="border rounded px-2 py-1 w-full" />
          </div>
          <div class="flex-1">
            <label class="block text-sm mb-1">Окончание</label>
            <input v-model="endTime" type="time" class="border rounded px-2 py-1 w-full" />
          </div>
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      </div>

      <div class="mt-4 flex justify-between items-center">
        <button
          class="px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300"
          @click="close"
          :disabled="loading"
        >
          Отмена
        </button>

        <div class="flex gap-2">
          <button
            v-if="isEdit"
            class="px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700"
            @click="remove"
            :disabled="loading"
          >
            Удалить
          </button>

          <button
            class="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
            @click="save"
            :disabled="loading"
          >
            {{ isEdit ? 'Сохранить' : 'Создать' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
