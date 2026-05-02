<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/store/auth.store'

const auth = useAuthStore()

// ВАЖНО: роли должны быть computed, а не константы
const isAdmin = computed(() => auth.user?.role === 'ADMIN')
const isDoctor = computed(() => auth.user?.role === 'DOCTOR')
const isPatient = computed(() => auth.user?.role === 'PATIENT')
</script>

<template>
  <header class="bg-gradient-to-b from-white to-teal-100 border-b border-teal-200 shadow-sm">
    <!-- Верхняя панель -->
    <div class="px-6 pt-4 pb-3 grid grid-cols-[auto_1fr_auto] gap-6 items-center">
      <div class="w-[110px] h-[110px] shrink-0">
        <router-link to="/" class="block w-full h-full">
          <img src="/src/assets/medic.ico" alt="Logo" class="w-full h-full object-contain" />
        </router-link>
      </div>

      <div class="flex flex-col justify-center space-y-1">
        <a
          href="https://minzdrav.gov.by/"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm text-cyan-700 hover:text-cyan-800"
        >
          Министерство здравоохранения Республики Беларусь
        </a>

        <h1 class="text-2xl font-extrabold text-teal-800 leading-snug">
          Городская поликлиника №165, Минск
        </h1>
      </div>

      <div class="flex flex-col items-end space-y-2">
        <div class="text-sm text-gray-700 leading-tight text-right">
          <p>Минск, ул. Несуществующая 21</p>
          <p>Инфоцентр: +375 17 23 79 898</p>
        </div>

        <div class="w-64">
          <input
            type="text"
            placeholder="Поиск..."
            class="w-full px-3 py-1.5 rounded-md border border-teal-300 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>
      </div>
    </div>

    <!-- Нижнее меню -->
    <nav class="bg-teal-200 text-gray-800 px-6 py-3 shadow-inner">
      <ul class="flex items-center gap-8 text-lg font-semibold">
        <li><router-link to="/" class="hover:text-teal-900">Главная</router-link></li>
        <li><router-link to="/cabinets" class="hover:text-teal-900">Кабинеты</router-link></li>
        <li><router-link to="/doctors" class="hover:text-teal-900">Врачи</router-link></li>

        <li v-if="isAdmin || isDoctor">
          <router-link to="/patients" class="hover:text-teal-900">Пациенты</router-link>
        </li>

        <li v-if="isAdmin || isDoctor">
          <router-link to="/zones" class="hover:text-teal-900">Зоны</router-link>
        </li>

        <li v-if="isAdmin">
          <router-link to="/appointments" class="hover:text-teal-900">Все записи</router-link>
        </li>

        <li v-if="isDoctor || isPatient">
          <router-link to="/my-appointments" class="hover:text-teal-900">Мои записи</router-link>
        </li>

        <li v-if="isDoctor || isPatient">
          <router-link to="/my-visits" class="hover:text-teal-900">Мои визиты</router-link>
        </li>

        <li v-if="isAdmin || isDoctor">
          <router-link to="/visits" class="hover:text-teal-900">Все визиты</router-link>
        </li>

        <li class="ml-auto">
          <router-link to="/profile" class="hover:text-teal-900">Профиль</router-link>
        </li>
      </ul>
    </nav>
  </header>
</template>
