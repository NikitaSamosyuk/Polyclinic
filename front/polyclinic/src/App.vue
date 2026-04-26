<template>
  <div class="min-h-screen flex flex-col">
    <MainMenu />

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
