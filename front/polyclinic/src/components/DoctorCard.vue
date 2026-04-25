<script setup lang="ts">
const props = defineProps<{
  doctor: any | null
}>()

const base = import.meta.env.VITE_API_BASE || 'http://localhost:3000'
</script>

<template>
  <!-- Пока doctor не загружен -->
  <div
    v-if="!doctor"
    class="bg-white shadow rounded-xl p-3 border border-gray-200 flex items-center justify-center"
    style="width: 260px; height: 360px"
  >
    <span class="text-gray-500">Загрузка...</span>
  </div>

  <!-- Основная карточка -->
  <div
    v-else
    class="bg-white shadow rounded-xl p-3 border border-gray-200 hover:shadow-lg transition cursor-pointer"
    style="width: 260px; height: 360px; flex: 0 0 auto; display: block"
  >
    <div
      class="overflow-hidden rounded-md mb-3 flex justify-center items-center bg-gray-100"
      style="height: 260px; width: 100%"
    >
      <img
        :src="doctor.photoUrl ? base + doctor.photoUrl : base + '/uploads/defaults/doctor.png'"
        class="h-full w-auto object-cover"
        alt="Фото врача"
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
  </div>
</template>
