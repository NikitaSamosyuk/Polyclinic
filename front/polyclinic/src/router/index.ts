import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import Home from '../pages/Home.vue'
import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'
import Profile from '../pages/Profile.vue'
import Doctors from '../pages/Doctors.vue'
import Appointment from '../pages/Appointment.vue'
import Patients from '../pages/Patients.vue'
import MyAppointments from '../pages/MyAppointments.vue'
import DoctorAppointments from '../pages/DoctorAppointments.vue'
import DoctorProfile from '../pages/DoctorProfile.vue'
import PatientCard from '../components/PatientCard.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/profile', name: 'Profile', component: Profile },
  { path: '/doctors', name: 'Doctors', component: Doctors },
  { path: '/patients', name: 'Patients', component: Patients },
  { path: '/appointment', name: 'Appointment', component: Appointment },
  { path: '/my-appointments', name: 'MyAppointments', component: MyAppointments },

  // Doctor routes
  { path: '/doctor/profile', name: 'DoctorProfile', component: DoctorProfile },
  { path: '/doctor/:id/appointments', name: 'DoctorAppointments', component: DoctorAppointments },

  // Patient card (компонент сам загружает данные по params.id, если проп не передан)
  { path: '/patients/:id', name: 'PatientCard', component: PatientCard },

  // catch-all
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
