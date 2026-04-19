<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../store/auth.store'
import { useRouter } from 'vue-router'

const username = ref('')
const email = ref('')
const password = ref('')
const auth = useAuthStore()
const router = useRouter()

async function submit() {
  await auth.register(username.value, email.value, password.value)
  router.push('/profile')
}
</script>

<template>
  <div>
    <h1>Регистрация</h1>
    <input v-model="username" placeholder="Имя" />
    <input v-model="email" placeholder="Email" />
    <input v-model="password" placeholder="Пароль" type="password" />
    <button @click="submit">Создать аккаунт</button>
  </div>
</template>
