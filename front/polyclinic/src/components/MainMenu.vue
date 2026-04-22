<template>
  <nav class="menu">
    <router-link to="/">Главная</router-link>
    <router-link to="/doctors">Врачи</router-link>
    <router-link to="/patients">Пациенты</router-link>
    <router-link to="/appointment">Запись</router-link>
    <router-link to="/my-appointments">Мои записи</router-link>
    <router-link to="/profile">Профиль</router-link>
  </nav>
</template>

<script setup lang="ts">
// Роль больше не проверяется на фронте — показываем ссылку на пациентов всегда.
// Позже можно вернуть проверку, если потребуется.
</script>

<style scoped>
.menu {
  display: flex;
  gap: 20px;
  padding: 15px 25px;
  background: #1e1e1e;
}

.menu a {
  color: white;
  text-decoration: none;
  font-weight: 500;
}

.menu a.router-link-active {
  text-decoration: underline;
}
</style>
