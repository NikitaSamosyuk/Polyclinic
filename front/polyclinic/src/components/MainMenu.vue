<template>
  <nav class="menu">
    <router-link to="/">Главная</router-link>
    <router-link to="/doctors">Врачи</router-link>
    <router-link to="/appointment">Запись</router-link>
    <router-link to="/profile">Профиль</router-link>
    <router-link to="/login">Войти</router-link>
  </nav>
</template>

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
