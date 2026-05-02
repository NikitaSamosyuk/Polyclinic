<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { doctorsApi } from '@/api/doctors'

import DoctorCard from '@/components/DoctorCard.vue'
import CreateDoctorUserModal from '@/pages/Admin/CreateDoctorUserModal.vue'
import CreateDoctorProfileModal from '@/pages/Admin/CreateDoctorProfileModal.vue'
import EditDoctorModal from '@/pages/Admin/DoctorEditModal.vue'
import DoctorActivateModal from '@/pages/Admin/DoctorActivateModal.vue'
import DoctorDeactivateModal from '@/pages/Admin/DoctorDeactiveModal.vue'

const doctors = ref<any[]>([])
const loading = ref(true)

const showCreateUser = ref(false)
const showCreateDoctor = ref(false)
const showEdit = ref(false)
const showActivate = ref(false)
const showDeactivate = ref(false)

const createdUserId = ref<number | null>(null)
const selectedDoctor = ref<any | null>(null)

// PAGINATION
const page = ref(1)
const perPage = 8

const paginatedDoctors = computed(() => {
  const start = (page.value - 1) * perPage
  return doctors.value.slice(start, start + perPage)
})

const totalPages = computed(() => Math.max(1, Math.ceil(doctors.value.length / perPage)))

async function loadDoctors() {
  loading.value = true
  try {
    const list = await doctorsApi.getAll()
    doctors.value = [...list].sort((a, b) => a.lastName.localeCompare(b.lastName))
  } catch {
    doctors.value = []
  } finally {
    loading.value = false
  }
}

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
  loadDoctors()
}

function openEdit(d: any) {
  selectedDoctor.value = d
  showEdit.value = true
}

function openDeactivate(d: any) {
  selectedDoctor.value = d
  showDeactivate.value = true
}

function openActivate(d: any) {
  selectedDoctor.value = d
  showActivate.value = true
}

onMounted(loadDoctors)
</script>

<template>
  <div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    <div
      class="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl p-10 space-y-10"
    >
      <!-- HEADER -->
      <div class="flex justify-between items-center sticky top-0 bg-white pb-4">
        <h2 class="text-3xl font-bold text-teal-800">Управление врачами</h2>

        <button class="text-gray-600 hover:text-black text-xl" @click="$emit('close')">✕</button>
      </div>

      <!-- CREATE BUTTON -->
      <button
        class="bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700 transition"
        @click="openCreateUser"
      >
        Создать врача
      </button>

      <!-- LOADING -->
      <div v-if="loading" class="text-center text-gray-600 py-10 text-lg">Загрузка...</div>

      <!-- GRID -->
      <div v-else class="grid grid-cols-[repeat(auto-fit,260px)] justify-center gap-8">
        <DoctorCard
          v-for="d in paginatedDoctors"
          :key="d.id"
          :doctor="d"
          adminMode
          @edit="openEdit"
          @activate="openActivate"
          @deactivate="openDeactivate"
        />
      </div>

      <!-- PAGINATION -->
      <div v-if="totalPages > 1" class="flex justify-center mt-10 gap-2">
        <button
          v-for="p in totalPages"
          :key="p"
          @click="page = p"
          class="px-4 py-2 rounded-lg border border-teal-300 shadow-sm transition"
          :class="p === page ? 'bg-teal-600 text-white' : 'bg-white hover:bg-teal-50 text-teal-800'"
        >
          {{ p }}
        </button>
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

      <DoctorDeactivateModal
        v-if="showDeactivate"
        :doctor="selectedDoctor"
        @close="showDeactivate = false"
        @updated="loadDoctors"
      />

      <DoctorActivateModal
        v-if="showActivate"
        :doctor="selectedDoctor"
        @close="showActivate = false"
        @updated="loadDoctors"
      />
    </div>
  </div>
</template>
