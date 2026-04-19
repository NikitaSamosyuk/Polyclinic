<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../store/auth.store'
import { usersApi } from '../api/users'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const avatar = ref<string>('')

async function loadAvatar() {
  try {
    const res = await usersApi.getAvatar()
    avatar.value = 'http://localhost:3000' + res.data.avatarUrl
  } catch {
    avatar.value = ''
  }
}

async function uploadAvatar(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files?.length) return

  await usersApi.uploadAvatar(target.files[0])
  await loadAvatar()
}

async function logout() {
  await auth.logout()
  router.push('/login')
}

onMounted(async () => {
  await auth.loadMe()
  if (auth.user) await loadAvatar()
})
</script>

<template>
  <div>
    <h1>Профиль</h1>

    <button @click="logout">Выйти</button>

    <div v-if="auth.user">
      <img v-if="avatar" :src="avatar" width="120" />

      <input type="file" @change="uploadAvatar" />

      <pre>{{ auth.user }}</pre>

      <router-link v-if="auth.user.role === 'DOCTOR'" to="/doctor-photo"> Фото врача </router-link>

      <router-link v-if="auth.user.role === 'PATIENT'" to="/patient">
        Мой профиль пациента
      </router-link>

      <router-link to="/doctors">Список врачей</router-link>
      <router-link to="/appointment">Записаться на приём</router-link>
    </div>

    <div v-else>
      <p>Вы не авторизованы</p>
    </div>
  </div>
</template>
