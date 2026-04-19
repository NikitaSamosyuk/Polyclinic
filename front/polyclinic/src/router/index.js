import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'
import Profile from '../pages/Profile.vue'
import DoctorPhoto from '../pages/DoctorPhoto.vue'
import Doctors from '../pages/Doctors.vue'
import Appointment from '../pages/Appointment.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/profile', component: Profile },
    { path: '/doctor-photo', component: DoctorPhoto },
    { path: '/doctors', component: Doctors },
    { path: '/appointment', component: Appointment },
  ],
})
