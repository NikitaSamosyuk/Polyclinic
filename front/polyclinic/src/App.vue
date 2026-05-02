<template>
  <div class="min-h-screen flex justify-center bg-gray-200">
    <!-- Белый лист -->
    <div
      class="w-full max-w-[1200px] min-h-screen flex flex-col bg-white shadow-xl border border-gray-300"
    >
      <!-- Главное меню -->
      <MainMenu />

      <!-- Контентная область -->
      <main class="flex-1 flex justify-center py-6 px-4">
        <div class="w-full max-w-5xl">
          <router-view />
        </div>
      </main>

      <!-- Футер -->
      <Footer />
    </div>
  </div>
</template>

<script setup lang="ts">
import MainMenu from './components/MainMenu.vue'
import Footer from './components/Footer.vue'
</script>
