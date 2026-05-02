<script setup lang="ts">
import { useAuthStore } from '@/store/auth.store'

const props = defineProps<{
  doctor: any | null
}>()

const emit = defineEmits(['edit', 'deactivate', 'activate'])

const base = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

const auth = useAuthStore()
const isAdmin = auth.user?.role === 'ADMIN'
</script>

<template>
  <div
    v-if="!doctor"
    class="bg-white shadow rounded-xl p-3 border border-gray-200 flex items-center justify-center"
    style="width: 260px; height: 360px"
  >
    <span class="text-gray-500">Загрузка...</span>
  </div>

  <div
    v-else
    class="bg-white shadow rounded-xl p-3 border border-gray-200 hover:shadow-lg transition"
    style="
      width: 260px;
      min-height: 360px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    "
  >
    <div>
      <div
        class="overflow-hidden rounded-md mb-3 flex justify-center items-center bg-gray-100"
        style="height: 260px; width: 100%"
      >
        <img
          :src="doctor.photoUrl ? base + doctor.photoUrl : base + '/uploads/defaults/doctor.png'"
          class="h-full w-auto object-cover"
        />
      </div>

      <h3 class="text-base font-semibold text-gray-800 leading-tight line-clamp-2">
        {{ doctor.lastName }} {{ doctor.firstName }}
        <span v-if="doctor.middleName">{{ doctor.middleName }}</span>
      </h3>

      <p class="text-gray-600 text-sm mt-1">
        {{ doctor.specialization }}
        <span v-if="doctor.isTherapist" class="text-blue-600 font-medium ml-1">(Терапевт)</span>
      </p>

      <p v-if="doctor.cabinetNumber" class="text-gray-500 text-xs mt-1">
        Кабинет: {{ doctor.cabinetNumber }}
      </p>

      <!-- 🔥 СТАТУС ВИДЕН ТОЛЬКО АДМИНУ -->
      <p v-if="isAdmin" class="text-xs mt-1">
        <span :class="doctor.user?.isActive ? 'text-green-600' : 'text-red-600'">
          ● {{ doctor.user?.isActive ? 'Активен' : 'Деактивирован' }}
        </span>
      </p>
    </div>

    <div v-if="isAdmin" class="flex gap-2 mt-3">
      <button
        class="flex-1 bg-yellow-500 text-white py-1.5 rounded-lg hover:bg-yellow-600 text-xs"
        @click="emit('edit', doctor)"
      >
        Редактировать
      </button>

      <button
        v-if="doctor.user?.isActive"
        class="flex-1 bg-red-600 text-white py-1.5 rounded-lg hover:bg-red-700 text-xs"
        @click="emit('deactivate', doctor)"
      >
        Деактивировать
      </button>

      <button
        v-else
        class="flex-1 bg-green-600 text-white py-1.5 rounded-lg hover:bg-green-700 text-xs"
        @click="emit('activate', doctor)"
      >
        Активировать
      </button>
    </div>
  </div>
</template>
