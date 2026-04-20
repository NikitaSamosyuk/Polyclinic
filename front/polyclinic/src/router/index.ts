import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import Home from '../pages/Home.vue'
import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'
import Profile from '../pages/Profile.vue'
import Doctors from '../pages/Doctors.vue'
import Appointment from '../pages/Appointment.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/profile', component: Profile },
  { path: '/doctors', component: Doctors },
  { path: '/appointment', component: Appointment },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
