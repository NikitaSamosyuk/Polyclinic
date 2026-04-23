<script setup lang="ts">
const props = defineProps<{
  doctor: any
}>()

const base = import.meta.env.VITE_API_BASE || 'http://localhost:3000'
</script>

<template>
  <div
    class="bg-white shadow rounded-xl p-3 border border-gray-200 hover:shadow-lg transition cursor-pointer"
  >
    <!-- КОНТЕЙНЕР, КОТОРЫЙ ДЕЛАЕТ ФОТО ВЕРТИКАЛЬНЫМ И КРАСИВЫМ -->
    <div
      class="w-full h-72 overflow-hidden rounded-md mb-3 flex justify-center items-center bg-gray-100"
    >
      <img
        :src="doctor.photoUrl ? base + doctor.photoUrl : base + '/uploads/defaults/doctor.png'"
        class="h-full w-auto object-cover"
      />
    </div>

    <h3 class="text-base font-semibold text-gray-800 leading-tight">
      {{ doctor.lastName }} {{ doctor.firstName }} {{ doctor.middleName }}
    </h3>

    <p class="text-gray-600 text-sm mt-1">
      {{ doctor.specialization }}
      <span v-if="doctor.isTherapist" class="text-blue-600 font-medium ml-1"> (Терапевт) </span>
    </p>

    <p v-if="doctor.cabinetNumber" class="text-gray-500 text-xs mt-1">
      Кабинет: {{ doctor.cabinetNumber }}
    </p>
  </div>
</template>
