<script setup>
import MainMenu from './components/MainMenu.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <div class="layout">
    <MainMenu />

    <main class="content">
      <router-view />
    </main>

    <Footer />
  </div>
</template>

<style>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content {
  flex: 1;
  padding: 20px;
}
</style>
