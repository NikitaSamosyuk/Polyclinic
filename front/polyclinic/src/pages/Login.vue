<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../store/auth.store'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const auth = useAuthStore()
const router = useRouter()

async function submit() {
  await auth.login(email.value, password.value)
  router.push('/profile')
}
</script>

<template>
  <div>
    <h1>Вход</h1>
    <input v-model="email" placeholder="Email" />
    <input v-model="password" placeholder="Пароль" type="password" />
    <button @click="submit">Войти</button>
  </div>
</template>
