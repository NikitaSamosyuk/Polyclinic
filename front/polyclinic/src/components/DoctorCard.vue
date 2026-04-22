<template>
  <!-- Если данные корректные -->
  <div
    v-if="safeDoctor"
    class="flex gap-4 p-4 mb-4 border rounded-xl shadow-sm bg-white items-center"
  >
    <img
      :src="photoSrc"
      alt="Фото врача"
      class="w-20 h-20 rounded-full object-cover border shadow"
    />

    <div class="flex flex-col gap-1">
      <h3 class="text-lg font-semibold text-gray-800">
        {{ safeDoctor.lastName }}
        {{ safeDoctor.firstName }}
        {{ safeDoctor.middleName || '' }}
      </h3>

      <p class="text-gray-600">
        <span class="font-medium">Специальность:</span>
        {{ safeDoctor.specialization }}
      </p>

      <p class="text-gray-600">
        <span class="font-medium">Терапевт:</span>
        {{ safeDoctor.isTherapist ? 'Да' : 'Нет' }}
      </p>

      <p v-if="safeDoctor.cabinetNumber" class="text-gray-600">
        <span class="font-medium">Кабинет:</span>
        №{{ safeDoctor.cabinetNumber }}
      </p>

      <div v-if="canEdit" class="mt-2">
        <input
          type="file"
          @change="uploadPhoto"
          class="block text-sm text-gray-700 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border file:border-gray-300 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
        />
      </div>
    </div>
  </div>

  <!-- Если пришёл мусор -->
  <div v-else class="p-4 mb-4 border rounded-xl bg-red-50 text-red-700 font-medium">
    Ошибка: некорректные данные врача
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuthStore } from '../store/auth.store'
import api from '../api/axios'

interface Doctor {
  id: number
  userId: number
  firstName: string
  lastName: string
  middleName?: string | null
  specialization: string
  isTherapist: boolean
  photoUrl?: string | null
  cabinetNumber?: string | null
}

const props = defineProps<{
  doctor: Doctor | string | null | undefined
}>()

// 🛡 Защита от мусора
const safeDoctor = computed<Doctor | null>(() => {
  if (props.doctor && typeof props.doctor === 'object') return props.doctor
  return null
})

const auth = useAuthStore()

// Локальное фото (props менять нельзя)
const localPhotoUrl = ref<string | null>(safeDoctor.value?.photoUrl ?? null)

watch(
  () => props.doctor,
  (d) => {
    if (d && typeof d === 'object') {
      localPhotoUrl.value = d.photoUrl ?? null
    }
  }
)

const photoSrc = computed(() => {
  if (!localPhotoUrl.value) {
    return 'https://via.placeholder.com/80?text=No+Photo'
  }
  return 'http://localhost:3000' + localPhotoUrl.value
})

const canEdit = computed(() => {
  if (!auth.user || !safeDoctor.value) return false
  return auth.user.role === 'ADMIN' || auth.user.id === safeDoctor.value.userId
})

async function uploadPhoto(e: Event) {
  if (!safeDoctor.value) return

  const target = e.target as HTMLInputElement
  if (!target.files?.length) return

  const form = new FormData()
  form.append('photo', target.files[0])

  await api.post('/doctors/photo', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  localPhotoUrl.value = `/uploads/doctors/doctor_${safeDoctor.value.userId}.png?t=${Date.now()}`
}
</script>
