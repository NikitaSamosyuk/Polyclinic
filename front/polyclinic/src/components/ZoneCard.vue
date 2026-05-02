<script setup>
const props = defineProps({
  zones: { type: Array, required: true },
  opened: { type: Boolean, required: true },
  isAdmin: { type: Boolean, required: true },
})

const emit = defineEmits(['select', 'delete'])
</script>

<template>
  <div v-if="opened" class="mt-3 space-y-3">
    <div
      v-for="z in zones"
      :key="z.id"
      class="p-4 bg-white border border-teal-300 rounded-lg shadow-sm hover:shadow-md transition"
    >
      <div class="flex justify-between items-start">
        <!-- Если админ — зона кликабельна -->
        <div v-if="isAdmin" class="cursor-pointer" @click.stop="emit('select', z)">
          <p class="font-semibold text-gray-900">{{ z.street }}</p>
          <p class="text-sm text-gray-600">Дома: {{ z.houses.join(', ') }}</p>
        </div>

        <!-- Если НЕ админ — просто текст -->
        <div v-else>
          <p class="font-semibold text-gray-900">{{ z.street }}</p>
          <p class="text-sm text-gray-600">Дома: {{ z.houses.join(', ') }}</p>
        </div>

        <!-- Кнопки только для админа -->
        <div v-if="isAdmin" class="flex gap-2">
          <button
            class="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow"
            @click.stop="emit('select', z)"
          >
            ✏
          </button>

          <button
            class="px-3 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 shadow"
            @click.stop="emit('delete', z)"
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
