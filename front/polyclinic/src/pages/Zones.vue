<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
import ZoneCard from '@/components/ZoneCard.vue'
import ZoneForm from './Zones/ZoneForm.vue'
import ZoneDelete from './Zones/ZoneDelete.vue'

const zones = ref([])
const loading = ref(true)
const error = ref(null)

const selectedZone = ref(null)

const showCreate = ref(false)
const showEdit = ref(false)
const showDelete = ref(false)

async function load() {
  try {
    const res = await api.get('/therapist-zones')
    zones.value = res.data
  } catch (e) {
    error.value = e?.response?.data?.message || 'Ошибка загрузки'
  } finally {
    loading.value = false
  }
}

function select(z) {
  selectedZone.value = z
}

function onCreated(z) {
  zones.value.push(z)
  showCreate.value = false
}

function onUpdated(z) {
  const idx = zones.value.findIndex((x) => x.id === z.id)
  if (idx !== -1) zones.value[idx] = z
  selectedZone.value = z
  showEdit.value = false
}

function onDeleted(id) {
  zones.value = zones.value.filter((z) => z.id !== id)
  selectedZone.value = null
  showDelete.value = false
}

onMounted(load)
</script>

<template>
  <div class="p-6 max-w-6xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Зоны терапевтов</h1>
      <button @click="showCreate = true" class="px-4 py-2 bg-green-600 text-white rounded-lg">
        + Создать
      </button>
    </div>

    <div v-if="loading" class="text-gray-600">Загрузка...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>

    <div v-else class="grid grid-cols-2 gap-4">
      <div
        v-for="z in zones"
        :key="z.id"
        @click="select(z)"
        class="p-4 bg-white border rounded-lg shadow cursor-pointer hover:shadow-md"
      >
        <p class="font-semibold">{{ z.doctor?.lastName }} {{ z.doctor?.firstName }}</p>
        <p class="text-gray-600 text-sm">{{ z.street }}</p>
      </div>
    </div>

    <div v-if="selectedZone" class="mt-8">
      <ZoneCard :zone="selectedZone" />

      <div class="flex gap-3 mt-4">
        <button @click="showEdit = true" class="px-4 py-2 bg-blue-600 text-white rounded-lg">
          Редактировать
        </button>

        <button @click="showDelete = true" class="px-4 py-2 bg-red-600 text-white rounded-lg">
          Удалить
        </button>
      </div>
    </div>

    <!-- Модалки -->
    <ZoneForm v-if="showCreate" mode="create" @close="showCreate = false" @saved="onCreated" />

    <ZoneForm
      v-if="showEdit"
      mode="edit"
      :zone="selectedZone"
      @close="showEdit = false"
      @saved="onUpdated"
    />

    <ZoneDelete
      v-if="showDelete"
      :zone="selectedZone"
      @close="showDelete = false"
      @deleted="onDeleted"
    />
  </div>
</template>
