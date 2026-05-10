<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-red-50 p-8">
    <div class="bg-white border border-red-300 rounded-2xl shadow p-10 max-w-lg text-center">
      <h1 class="text-3xl font-bold text-red-700 mb-4">Ваш профиль деактивирован</h1>

      <p class="text-gray-700 text-lg mb-6 leading-relaxed">
        Доступ к системе ограничен. Пожалуйста, обратитесь к администратору поликлиники.
      </p>

      <button
        @click="goLogin"
        class="px-6 py-3 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
      >
        Вернуться на страницу входа
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

function goLogin() {
  router.push('/login')
}
</script>
