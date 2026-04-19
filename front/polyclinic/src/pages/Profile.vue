<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../store/auth.store'
import { usersApi } from '../api/users'
import { useRouter } from 'vue-router'

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
          <h2>Данные пользователя</h2>
          <pre>{{ auth.user }}</pre>

          <div class="links">
            <router-link to="/doctor-photo">Фото врача</router-link>
            <router-link to="/doctors">Список врачей</router-link>
            <router-link to="/appointment">Записаться на приём</router-link>
          </div>
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
.profile-page {
  display: flex;
  justify-content: center;
  padding: 40px 20px;
}

.card {
  width: 100%;
  max-width: 900px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  padding: 24px 28px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-content {
  display: flex;
  gap: 32px;
  margin-top: 20px;
}

.avatar-block {
  width: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.avatar-wrapper {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  color: #999;
  font-size: 14px;
}

.info-block {
  flex: 1;
}

.links {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.links a {
  color: #1976d2;
  text-decoration: none;
}

.links a:hover {
  text-decoration: underline;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  background: #1976d2;
  color: white;
  font-size: 14px;
}

.btn-logout {
  background: #e53935;
}

.btn-upload {
  background: #43a047;
}

.btn:hover {
  opacity: 0.9;
}

.error-text {
  color: #e53935;
  font-size: 13px;
  text-align: center;
}

.not-auth {
  margin-top: 20px;
}
</style>
