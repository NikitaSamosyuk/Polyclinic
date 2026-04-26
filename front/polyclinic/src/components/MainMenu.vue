<script setup lang="ts">
import { useAuthStore } from '@/store/auth.store'
const auth = useAuthStore()
</script>

<template>
  <nav v-if="auth.ready" class="w-full bg-gray-900 px-6 py-4 shadow-md">
    <ul class="flex items-center gap-6">
      <!-- Главная -->
      <li>
        <router-link to="/" class="text-gray-200 hover:text-white">Главная</router-link>
      </li>

      <!-- Кабинеты -->
      <li>
        <router-link to="/cabinets" class="text-gray-200 hover:text-white">Кабинеты</router-link>
      </li>

      <!-- Врачи -->
      <li>
        <router-link to="/doctors" class="text-gray-200 hover:text-white">Врачи</router-link>
      </li>

      <!-- Пациенты — только доктор и админ -->
      <li v-if="auth.user?.role === 'ADMIN' || auth.user?.role === 'DOCTOR'">
        <router-link to="/patients" class="text-gray-200 hover:text-white">Пациенты</router-link>
      </li>

      <!-- Зоны — только доктор и админ -->
      <li v-if="auth.user?.role === 'ADMIN' || auth.user?.role === 'DOCTOR'">
        <router-link to="/zones" class="text-gray-200 hover:text-white">Зоны</router-link>
      </li>

      <!-- Все записи — только админ -->
      <li v-if="auth.user?.role === 'ADMIN'">
        <router-link to="/appointments" class="text-gray-200 hover:text-white">
          Все записи
        </router-link>
      </li>

      <!-- Мои записи — для всех авторизованных -->
      <li v-if="auth.user">
        <router-link to="/my-appointments" class="text-gray-200 hover:text-white">
          Мои записи
        </router-link>
      </li>

      <!-- Профиль -->
      <li class="ml-auto">
        <router-link to="/profile" class="text-gray-200 hover:text-white"> Профиль </router-link>
      </li>
    </ul>
  </nav>
</template>
