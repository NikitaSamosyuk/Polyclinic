<script setup lang="ts">
import { ref } from 'vue'

import DoctorsManageModal from '@/pages/Admin/DoctorsManageModal.vue'
import CreateDoctorUserModal from '@/pages/Admin/CreateDoctorUserModal.vue'
import CreateDoctorProfileModal from '@/pages/Admin/CreateDoctorProfileModal.vue'

const showManageDoctors = ref(false)
const showCreateUser = ref(false)
const showCreateDoctor = ref(false)

const createdUserId = ref<number | null>(null)

function openCreateUser() {
  createdUserId.value = null
  showCreateUser.value = true
}

function onUserCreated(id: number) {
  createdUserId.value = id
  showCreateUser.value = false
  showCreateDoctor.value = true
}

function onDoctorCreated() {
  showCreateDoctor.value = false
}
</script>

<template>
  <div class="bg-white border border-teal-300 rounded-2xl shadow p-8 space-y-10">
    <h1 class="text-3xl font-bold text-teal-800">Панель администратора</h1>

    <div class="flex flex-col gap-4">
      <button
        class="bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700 transition"
        @click="openCreateUser"
      >
        Создать врача
      </button>

      <button
        class="bg-teal-600 text-white px-6 py-3 rounded-lg shadow hover:bg-teal-700 transition"
        @click="showManageDoctors = true"
      >
        Управление врачами
      </button>
    </div>

    <!-- Модалки -->
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

    <DoctorsManageModal v-if="showManageDoctors" @close="showManageDoctors = false" />
  </div>
</template>
