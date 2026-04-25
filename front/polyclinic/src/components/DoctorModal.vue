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
  () => {
    if (props.show) load()
  }
)

watch(
  () => props.show,
  (val) => {
    if (val) load()
  }
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
    class="fixed inset-0 z-[9999] flex items-center justify-center"
    @click.self="close"
    style="backdrop-filter: blur(8px); background: rgba(255, 255, 255, 0.25)"
  >
    <div
      class="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fadeIn"
    >
      <button class="absolute top-3 right-3 text-gray-500 hover:text-black text-xl" @click="close">
        ✖
      </button>

      <div v-if="loading" class="text-gray-600 text-lg">Загрузка...</div>
      <div v-else-if="error" class="text-red-600 text-lg">{{ error }}</div>

      <!-- ВАЖНО: центрирование карточки -->
      <div v-else class="w-full flex justify-center">
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
