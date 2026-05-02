<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { doctorsApi } from '@/api/doctors'
import DoctorCard from '@/components/DoctorCard.vue'

const props = defineProps<{
  doctorId: number | null
  show: boolean
}>()

const emit = defineEmits(['close'])

const doctor = ref(null)
const loading = ref(false)
const error = ref<string | null>(null)

async function load() {
  if (!props.doctorId) return
  loading.value = true
  error.value = null

  try {
    const res = await doctorsApi.getById(props.doctorId)
    doctor.value = res
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Ошибка загрузки врача'
  } finally {
    loading.value = false
  }
}

watch(
  () => props.doctorId,
  () => props.show && load()
)
watch(
  () => props.show,
  (v) => v && load()
)

onMounted(() => {
  if (props.show) load()
})

function close() {
  emit('close')
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
    @click.self="close"
  >
    <div
      class="relative bg-white border border-teal-300 rounded-2xl shadow-xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto animate-fadeIn"
    >
      <!-- Кнопка закрытия (картинка cancel.png) -->
      <button
        class="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
        @click="close"
      >
        <img
          src="@/assets/cancel.png"
          alt="close"
          class="w-6 h-6 object-contain pointer-events-none"
        />
      </button>

      <!-- Состояния -->
      <div v-if="loading" class="text-gray-600 text-lg text-center py-6">Загрузка...</div>

      <div v-else-if="error" class="text-red-600 text-lg text-center py-6">
        {{ error }}
      </div>

      <!-- Карточка врача -->
      <div v-else class="flex justify-center">
        <DoctorCard :doctor="doctor" />
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.15s ease-out;
}
</style>
