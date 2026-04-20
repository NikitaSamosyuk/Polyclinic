<template>
  <div class="doctor-card">
    <img :src="photoSrc" class="photo" alt="Фото врача" />

    <div class="info">
      <h3>{{ doctor.lastName }} {{ doctor.firstName }} {{ doctor.middleName || '' }}</h3>

      <p><strong>Специальность:</strong> {{ doctor.specialization }}</p>

      <p>
        <strong>Терапевт:</strong>
        {{ doctor.isTherapist ? 'Да' : 'Нет' }}
      </p>

      <p v-if="doctor.cabinetNumber"><strong>Кабинет:</strong> №{{ doctor.cabinetNumber }}</p>

      <div v-if="canEdit" class="upload-block">
        <input type="file" @change="uploadPhoto" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '../store/auth.store'
import api from '../api/axios'

const props = defineProps<{
  doctor: {
    id: number
    userId: number
    firstName: string
    lastName: string
    middleName?: string | null
    specialization: string
    isTherapist: boolean
    photoUrl?: string | null
    cabinetNumber?: string | null
  }
}>()

const auth = useAuthStore()

const photoSrc = computed(() => {
  if (!props.doctor.photoUrl) {
    return 'https://via.placeholder.com/80?text=No+Photo'
  }
  return 'http://localhost:3000' + props.doctor.photoUrl
})

const canEdit = computed(() => {
  if (!auth.user) return false
  return auth.user.role === 'ADMIN' || auth.user.id === props.doctor.userId
})

async function uploadPhoto(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files?.length) return

  const form = new FormData()
  form.append('photo', target.files[0])

  await api.post('/doctors/photo', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  props.doctor.photoUrl = `/uploads/doctors/doctor_${props.doctor.userId}.png?t=${Date.now()}`
}
</script>

<style scoped>
.doctor-card {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.photo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.upload-block {
  margin-top: 10px;
}
</style>
