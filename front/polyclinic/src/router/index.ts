import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth.store'

const Home = () => import('@/pages/Home.vue')
const Authorization = () => import('@/pages/Login/Authorization.vue')
const Registration = () => import('@/pages/Login/Registration.vue')
const Profile = () => import('@/pages/Profile.vue')

const Doctors = () => import('@/pages/Doctors.vue')
const Patients = () => import('@/pages/Patients.vue')
const PatientCard = () => import('@/components/PatientCard.vue')
const Appointment = () => import('@/pages/Appointment.vue')
const MyAppointments = () => import('@/pages/MyAppointments.vue')
const DoctorAppointments = () => import('@/pages/DoctorAppointments.vue')

// Публичная карточка врача
const DoctorCardPage = () => import('@/pages/Doctor/DoctorCardPage.vue')

// Личные профили
const DoctorProfile = () => import('@/pages/Profile/DoctorProfile.vue')
const PatientProfile = () => import('@/pages/Profile/PatientProfile.vue')
const AdminProfile = () => import('@/pages/Profile/AdminProfile.vue')

// Зоны терапевтов
const Zones = () => import('@/pages/Zones.vue')

const routes = [
  { path: '/', name: 'Home', component: Home },

  { path: '/auth', name: 'Authorization', component: Authorization },
  { path: '/register', name: 'Registration', component: Registration },

  { path: '/profile', name: 'Profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/my-appointments', name: 'MyAppointments', component: MyAppointments, meta: { requiresAuth: true } },

  // --- DOCTORS ---
  { path: '/doctors', name: 'Doctors', component: Doctors },
  {
    path: '/doctors/:id',
    name: 'DoctorCardPage',
    component: DoctorCardPage,
    props: true,
  },

  // --- PATIENTS ---
  { path: '/patients', name: 'Patients', component: Patients },
  { path: '/patients/:id', name: 'PatientCard', component: PatientCard, props: true },

  // --- ZONES ---
  {
    path: '/zones',
    name: 'Zones',
    component: Zones,
    meta: { requiresAuth: true }, // зоны — админ/персонал
  },

  // --- APPOINTMENTS ---
  { path: '/appointment', name: 'Appointment', component: Appointment },
  {
    path: '/doctor/:id/appointments',
    name: 'DoctorAppointments',
    component: DoctorAppointments,
    meta: { requiresAuth: true },
  },

  // --- PERSONAL PROFILES ---
  {
    path: '/doctor/profile',
    name: 'DoctorProfile',
    component: DoctorProfile,
    meta: { requiresAuth: true },
  },
  {
    path: '/patient/profile',
    name: 'PatientProfile',
    component: PatientProfile,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/profile',
    name: 'AdminProfile',
    component: AdminProfile,
    meta: { requiresAuth: true },
  },

  // --- FALLBACK ---
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: Home },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  const token = localStorage.getItem('accessToken')

  // Разрешаем страницу авторизации всегда
  if (to.name === 'Authorization') return true

  // Инициализация auth
  if (!auth.ready) {
    if (token) {
      try {
        await auth.loadMe()
      } catch {
        localStorage.removeItem('accessToken')
        auth.user = null
      }
    }

    auth.ready = true
  }

  const isLoggedIn = !!localStorage.getItem('accessToken')

  if (to.meta.requiresAuth && !isLoggedIn) {
    return { name: 'Authorization' }
  }

  if (isLoggedIn && !auth.user) {
    localStorage.removeItem('accessToken')
    auth.accessToken = null
    return { name: 'Authorization' }
  }

  if (isLoggedIn && (to.name === 'Authorization' || to.name === 'Registration')) {
    return { name: 'Profile' }
  }

  return true
})


export default router
