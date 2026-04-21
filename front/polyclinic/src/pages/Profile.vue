<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../store/auth.store'
import { usersApi } from '../api/users'
import { useRouter } from 'vue-router'

import DoctorProfile from './DoctorProfile.vue'
import PatientProfile from './PatientProfile.vue'
import AdminProfile from './AdminProfile.vue'

const auth = useAuthStore()
const router = useRouter()

const avatar = ref<string>('')
const isUploading = ref(false)
const errorMessage = ref<string | null>(null)

async function loadAvatar() {
  try {
    const res = await usersApi.getAvatar()
    const raw = String(res.data.avatarUrl || '').replace(/^\/?/, '')
    avatar.value = `http://localhost:3000/${raw}`
  } catch {
    avatar.value = ''
  }
}

async function uploadAvatar(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files?.length) return

  const file = target.files[0]
  isUploading.value = true
  errorMessage.value = null

  try {
    await usersApi.uploadAvatar(file)
    await loadAvatar()
  } catch (err) {
    console.error(err)
    errorMessage.value = 'Не удалось загрузить файл (400). Проверь формат и размер.'
  } finally {
    isUploading.value = false
    target.value = ''
  }
}

async function logout() {
  await auth.logout()
  router.push('/login')
}

const profileComponent = computed(() => {
  if (!auth.user) return null
  switch (auth.user.role) {
    case 'DOCTOR':
      return DoctorProfile
    case 'PATIENT':
      return PatientProfile
    case 'ADMIN':
      return AdminProfile
    default:
      return null
  }
})

onMounted(async () => {
  await auth.loadMe()
  if (auth.user) {
    await loadAvatar()
  }
})
</script>

<template>
  <div class="profile-page">
    <div class="card">
      <header class="card-header">
        <h1>Профиль</h1>
        <button class="btn btn-logout" @click="logout">Выйти</button>
      </header>

      <div v-if="auth.user" class="profile-content">
        <section class="avatar-block">
          <div class="avatar-wrapper">
            <img v-if="avatar" :src="avatar" alt="Аватар" class="avatar-img" />
            <div v-else class="avatar-placeholder">Нет фото</div>
          </div>

          <label class="btn btn-upload">
            {{ isUploading ? 'Загрузка...' : 'Загрузить аватар' }}
            <input type="file" @change="uploadAvatar" hidden />
          </label>

          <p v-if="errorMessage" class="error-text">
            {{ errorMessage }}
          </p>
        </section>

        <section class="info-block">
          <component :is="profileComponent" :user="auth.user" />
        </section>
      </div>

      <div v-else class="not-auth">
        <p>Вы не авторизованы</p>
        <router-link class="btn" to="/login">Перейти к входу</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* твои стили без изменений */
</style>
