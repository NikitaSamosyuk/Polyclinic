<script setup lang="ts">
import { useAuthStore } from '@/store/auth.store'
const auth = useAuthStore()
</script>

<template>
  <nav v-if="auth.ready" class="w-full bg-gray-900 px-6 py-4 shadow-md">
    <ul class="flex items-center gap-6">
      <li>
        <router-link to="/" class="text-gray-200 hover:text-white">Главная</router-link>
      </li>

      <li>
        <router-link to="/cabinets" class="text-gray-200 hover:text-white">Кабинеты</router-link>
      </li>

      <li>
        <router-link to="/doctors" class="text-gray-200 hover:text-white">Врачи</router-link>
      </li>

      <li v-if="auth.user?.role === 'ADMIN' || auth.user?.role === 'DOCTOR'">
        <router-link to="/patients" class="text-gray-200 hover:text-white">Пациенты</router-link>
      </li>

      <li v-if="auth.user?.role === 'ADMIN' || auth.user?.role === 'DOCTOR'">
        <router-link to="/zones" class="text-gray-200 hover:text-white">Зоны</router-link>
      </li>

      <li>
        <router-link to="/appointment" class="text-gray-200 hover:text-white">Запись</router-link>
      </li>

      <li v-if="auth.user">
        <router-link to="/my-appointments" class="text-gray-200 hover:text-white">
          Мои записи
        </router-link>
      </li>

      <li class="ml-auto">
        <router-link to="/profile" class="text-gray-200 hover:text-white">Профиль</router-link>
      </li>
    </ul>
  </nav>
</template>
