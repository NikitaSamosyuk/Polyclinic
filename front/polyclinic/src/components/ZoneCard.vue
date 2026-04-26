<script setup>
const props = defineProps({
  zones: { type: Array, required: true },
  opened: { type: Boolean, required: true },
  isAdmin: { type: Boolean, required: true },
})

const emit = defineEmits(['select', 'delete'])
</script>

<template>
  <div v-if="opened" class="mt-3 space-y-2">
    <div v-for="z in zones" :key="z.id" class="p-3 bg-white border rounded">
      <div class="flex justify-between items-start">
        <div class="cursor-pointer" @click.stop="emit('select', z)">
          <p class="font-medium">{{ z.street }}</p>
          <p class="text-sm text-gray-600">Дома: {{ z.houses.join(', ') }}</p>
        </div>

        <div v-if="isAdmin" class="flex gap-2">
          <button
            class="px-2 py-1 text-sm bg-blue-500 text-white rounded"
            @click.stop="emit('select', z)"
          >
            ✏
          </button>

          <button
            class="px-2 py-1 text-sm bg-red-600 text-white rounded"
            @click.stop="emit('delete', z)"
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
