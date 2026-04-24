<template>
  <div class="bg-white p-4 rounded-lg shadow border">
    <h2 class="text-lg font-semibold mb-2">Зона терапевта</h2>

    <p class="text-gray-700">
      <span class="font-medium">Врач:</span>
      {{ zone.doctor?.lastName }} {{ zone.doctor?.firstName }}
    </p>

    <p class="mt-2 text-gray-700">
      <span class="font-medium">Улица:</span>
      {{ zone.street }}
    </p>

    <p class="mt-2 text-gray-700">
      <span class="font-medium">Дома:</span>
      {{ zone.houses?.join(', ') }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  zone: { type: Object, required: true },
})
</script>
