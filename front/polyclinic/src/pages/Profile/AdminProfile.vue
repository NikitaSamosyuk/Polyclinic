<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { doctorsApi } from '@/api/doctors'

import CreateDoctorUserModal from '@/pages/Admin/CreateDoctorUserModal.vue'
import CreateDoctorProfileModal from '@/pages/Admin/CreateDoctorProfileModal.vue'
import EditDoctorModal from '@/pages/admin/EditDoctorModal.vue'

const doctors = ref<any[]>([])
const loading = ref(true)

const showCreateUser = ref(false)
const showCreateDoctor = ref(false)
const showEdit = ref(false)

const createdUserId = ref<number | null>(null)
const selectedDoctor = ref<any | null>(null)

async function loadDoctors() {
  loading.value = true
  doctors.value = await doctorsApi.getAll()
  loading.value = false
}

function openCreateUser() {
  createdUserId.value = null
  showCreateUser.value = true
}

function onUserCreated(userId: number) {
  createdUserId.value = userId
  showCreateUser.value = false
  showCreateDoctor.value = true
}

function onDoctorCreated() {
  showCreateDoctor.value = false
  loadDoctors()
}

function openEdit(doctor: any) {
  selectedDoctor.value = doctor
  showEdit.value = true
}

async function deactivateDoctor(id: number) {
  if (!confirm('Вы уверены, что хотите деактивировать врача?')) return
  await doctorsApi.deactivate(id)
  await loadDoctors()
}

onMounted(loadDoctors)
</script>

<template>
  <div class="bg-white shadow-md rounded-xl p-6">
    <h2 class="text-2xl font-semibold mb-6">Управление врачами</h2>

    <button
      class="mb-6 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
      @click="openCreateUser"
    >
      Создать врача
    </button>

    <div v-if="loading" class="text-gray-600">Загрузка...</div>

    <div v-else class="space-y-4">
      <div
        v-for="d in doctors"
        :key="d.id"
        class="border rounded-lg p-4 flex justify-between items-center"
      >
        <div>
          <p class="text-lg font-semibold">{{ d.lastName }} {{ d.firstName }} {{ d.middleName }}</p>
          <p class="text-gray-600">{{ d.specialization }}</p>
          <p class="text-gray-500 text-sm">
            Кабинет:
            <span v-if="d.cabinet">№{{ d.cabinet.number }}</span>
            <span v-else>Не назначен</span>
          </p>
        </div>

        <div class="flex gap-3">
          <button
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            @click="openEdit(d)"
          >
            Редактировать
          </button>

          <button
            class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            @click="deactivateDoctor(d.id)"
          >
            Деактивировать
          </button>
        </div>
      </div>
    </div>

    <!-- MODALS -->
    <CreateDoctorUserModal
      v-if="showCreateUser"
      @close="showCreateUser = false"
      @created="onUserCreated"
    />

    <CreateDoctorProfileModal
      v-if="showCreateDoctor"
      :userId="createdUserId"
      @close="showCreateDoctor = false"
      @created="onDoctorCreated"
    />

    <EditDoctorModal
      v-if="showEdit"
      :doctor="selectedDoctor"
      @close="showEdit = false"
      @updated="loadDoctors"
    />
  </div>
</template>
