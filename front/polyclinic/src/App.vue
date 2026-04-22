<template>
  <div class="min-h-screen flex flex-col">
    <MainMenu />

    <div class="test-tailwind">
      <div class="bg-red-500 text-white px-4 py-2 rounded">Tailwind OK</div>
    </div>

    <main class="flex-1 w-[80%] max-w-5xl mx-auto px-4 py-6">
      <router-view />
    </main>

    <Footer />
  </div>
</template>

<script setup>
import MainMenu from './components/MainMenu.vue'
import Footer from './components/Footer.vue'
</script>
