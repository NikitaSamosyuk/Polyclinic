<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppointmentCard from '@/components/AppointmentCard.vue'
import { getAllAppointments } from '@/api/appointments'
import AppointmentEditModal from './appointment/AppointmentEditModal.vue'
import AppointmentDeleteModal from './appointment/AppointmentDeleteModal.vue'

const loading = ref(true)
const appointments = ref([])
const search = ref('')
const sort = ref('date')

const showEdit = ref(false)
const showDelete = ref(false)

const selected = ref(null)

async function load() {
  loading.value = true
  appointments.value = await getAllAppointments()
  loading.value = false
}

function openEdit(appt) {
  selected.value = appt
  showEdit.value = true
}

function openDelete(appt) {
  selected.value = appt
  showDelete.value = true
}

const filtered = computed(() => {
  const q = search.value.toLowerCase()

  let list = appointments.value.filter((a) =>
    `${a.patient.lastName} ${a.patient.firstName} ${a.doctor.lastName} ${a.doctor.firstName}`
      .toLowerCase()
      .includes(q)
  )

  if (sort.value === 'date') {
    list = list.sort(
      (a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()
    )
  }

  return list
})

onMounted(load)
</script>

<template>
  <div class="max-w-6xl mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Все записи</h1>
      <!-- Кнопку создания записи убрали -->
    </div>

    <!-- Поиск + сортировка -->
    <div class="flex gap-4 mb-6">
      <input
        v-model="search"
        class="px-3 py-2 border rounded w-full"
        placeholder="Поиск по ФИО пациента или врача"
      />

      <select v-model="sort" class="px-3 py-2 border rounded">
        <option value="date">По дате</option>
      </select>
    </div>

    <div v-if="loading">Загрузка...</div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AppointmentCard
        v-for="a in filtered"
        :key="a.id"
        :appointment="a"
        :is-admin="true"
        :is-doctor="false"
        :is-patient="false"
        @edit="openEdit"
        @delete="openDelete"
      />
    </div>

    <!-- Модалки -->
    <AppointmentEditModal v-model="showEdit" :appointment="selected" @saved="load" />
    <AppointmentDeleteModal v-model="showDelete" :appointment="selected" @deleted="load" />
  </div>
</template>
