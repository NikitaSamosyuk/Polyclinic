<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth.store'
import { usersApi } from '@/api/users'
import { patientsApi } from '@/api/patients'
import { doctorsApi } from '@/api/doctors'

import DoctorProfile from '@/pages/Profile/DoctorProfile.vue'
import PatientProfile from '@/pages/Profile/PatientProfile.vue'
import AdminProfile from '@/pages/Profile/AdminProfile.vue'
import PatientRegistration from '@/pages/Patient/PatientRegistration.vue'

const auth = useAuthStore()

const loading = ref(true)
const avatar = ref('')
const patient = ref(null)
const doctor = ref(null)
const showPatientRegistration = ref(false)

const editing = ref(false)
const changingPassword = ref(false)

const form = reactive({ username: '', email: '' })
const passwordForm = reactive({ current: '', new: '' })

const msg = ref<string | null>(null)

async function loadAvatar() {
  try {
    const res = await usersApi.getAvatar()
    const raw = String(res?.data?.avatarUrl || '').replace(/^\/?/, '')
    if (raw) {
      const base = import.meta.env.VITE_API_BASE || 'http://localhost:3000'
      avatar.value = `${base}/${raw}?t=${Date.now()}`
    } else avatar.value = ''
  } catch {
    avatar.value = ''
  }
}

async function loadPatientProfile() {
  if (auth.user?.role === 'PATIENT') {
    patient.value = await patientsApi.me()
  }
}

async function loadDoctorProfile() {
  if (auth.user?.role === 'DOCTOR') {
    const userId = auth.user.id
    if (!userId) return
    const res = await doctorsApi.getByUserId(userId)
    doctor.value = res.doctor ?? res
  }
}

function startEdit() {
  if (editing.value) {
    editing.value = false
    changingPassword.value = false
    msg.value = null
    return
  }

  editing.value = true
  changingPassword.value = false
  msg.value = null

  form.username = auth.user?.username || ''
  form.email = auth.user?.email || ''
}

async function saveProfile() {
  msg.value = null
  try {
    const res = await usersApi.updateProfile({
      username: form.username,
      email: form.email,
    })
    auth.user = { ...auth.user!, ...res.data }
    msg.value = 'Сохранено'
    editing.value = false
  } catch (e: any) {
    msg.value = e?.response?.data?.message || 'Ошибка'
  }
}

function startChangePassword() {
  if (!editing.value) return

  if (changingPassword.value) {
    changingPassword.value = false
    msg.value = null
    return
  }

  changingPassword.value = true
  msg.value = null
  passwordForm.current = ''
  passwordForm.new = ''
}

async function changePassword() {
  msg.value = null

  if (!passwordForm.current || !passwordForm.new) {
    msg.value = 'Заполните оба поля'
    return
  }

  try {
    await usersApi.changePassword({
      currentPassword: passwordForm.current,
      newPassword: passwordForm.new,
    })
    msg.value = 'Пароль изменён'
    changingPassword.value = false
  } catch (e: any) {
    msg.value = e?.response?.data?.message || 'Ошибка'
  }
}

async function onAvatarClick() {
  if (!editing.value) return

  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'

  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return
    try {
      const res = await usersApi.uploadAvatar(file)
      const raw = String(res?.data?.avatarUrl || '').replace(/^\/?/, '')
      const base = import.meta.env.VITE_API_BASE || 'http://localhost:3000'
      avatar.value = `${base}/${raw}?t=${Date.now()}`
      msg.value = 'Аватар обновлён'
    } catch {
      msg.value = 'Ошибка загрузки аватара'
    }
  }

  input.click()
}

onMounted(async () => {
  if (auth.user) {
    await loadAvatar()
    await loadPatientProfile()
    await loadDoctorProfile()
  }
  loading.value = false
})

function onPatientRegistered() {
  showPatientRegistration.value = false
  loadPatientProfile()
}
</script>

<template>
  <div class="max-w-5xl mx-auto p-8 flex flex-col gap-10">
    <h1 class="text-4xl font-extrabold text-teal-800 tracking-tight text-center">
      Профиль пользователя
    </h1>

    <div v-if="loading" class="text-gray-600 text-lg text-center py-10">Загрузка...</div>

    <template v-else>
      <!-- USER CARD -->
      <div
        v-if="auth.user"
        class="bg-white border border-teal-400 rounded-xl shadow p-6 flex flex-col md:flex-row items-center gap-6"
      >
        <!-- Аватар -->
        <div
          class="w-28 h-28 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center cursor-pointer border border-teal-300 shadow"
          @click="onAvatarClick"
        >
          <img v-if="avatar" :src="avatar" class="w-full h-full object-cover" />
          <span v-else class="text-gray-500 text-4xl font-bold">
            {{ auth.user.username[0].toUpperCase() }}
          </span>
        </div>

        <!-- Информация -->
        <div class="flex-1 text-center md:text-left">
          <h2 class="text-2xl font-bold text-gray-900">
            {{ auth.user.username }}
          </h2>
          <p class="text-gray-600 text-lg">{{ auth.user.email }}</p>

          <div class="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
            <button
              @click="startEdit"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
            >
              Редактировать
            </button>

            <button
              v-if="editing"
              @click="startChangePassword"
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300"
            >
              Сменить пароль
            </button>

            <button
              @click="auth.logout()"
              class="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700"
            >
              Выйти
            </button>
          </div>
        </div>
      </div>

      <!-- EDIT PROFILE -->
      <div
        v-if="auth.user && editing"
        class="bg-white border border-teal-300 rounded-xl shadow p-6 space-y-4"
      >
        <input
          v-model="form.username"
          class="w-full px-4 py-3 border border-teal-400 rounded-lg shadow-sm"
          placeholder="Имя пользователя"
        />
        <input
          v-model="form.email"
          class="w-full px-4 py-3 border border-teal-400 rounded-lg shadow-sm"
          placeholder="Email"
        />

        <button
          @click="saveProfile"
          class="w-full bg-green-600 text-white py-3 rounded-lg shadow hover:bg-green-700"
        >
          Сохранить
        </button>
      </div>

      <!-- CHANGE PASSWORD -->
      <div
        v-if="auth.user && changingPassword"
        class="bg-white border border-teal-300 rounded-xl shadow p-6 space-y-4"
      >
        <input
          v-model="passwordForm.current"
          type="password"
          class="w-full px-4 py-3 border border-teal-400 rounded-lg shadow-sm"
          placeholder="Текущий пароль"
        />

        <input
          v-model="passwordForm.new"
          type="password"
          class="w-full px-4 py-3 border border-teal-400 rounded-lg shadow-sm"
          placeholder="Новый пароль"
        />

        <button
          @click="changePassword"
          class="w-full bg-blue-600 text-white py-3 rounded-lg shadow hover:bg-blue-700"
        >
          Изменить пароль
        </button>
      </div>

      <p v-if="msg" class="text-center text-gray-700">{{ msg }}</p>

      <!-- PATIENT PROFILE -->
      <div v-if="auth.user?.role === 'PATIENT' && patient" class="mt-10">
        <PatientProfile :patient="patient" />
      </div>

      <!-- PATIENT REGISTRATION BUTTON -->
      <div v-if="auth.user?.role === 'PATIENT' && !patient" class="mt-10 text-center">
        <button
          @click="showPatientRegistration = true"
          class="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
        >
          Стать пациентом
        </button>
      </div>

      <!-- DOCTOR PROFILE -->
      <div v-if="auth.user?.role === 'DOCTOR' && doctor" class="mt-10">
        <DoctorProfile :doctor="doctor" @updated="doctor = $event" />
      </div>

      <!-- ADMIN PROFILE -->
      <div v-if="auth.user?.role === 'ADMIN'" class="mt-10">
        <AdminProfile />
      </div>

      <!-- MODAL -->
      <PatientRegistration
        v-if="showPatientRegistration"
        @close="showPatientRegistration = false"
        @success="onPatientRegistered"
      />

      <div v-if="!auth.user" class="mt-10 text-gray-600 text-center">
        Профиль недоступен. Попробуйте войти заново.
      </div>
    </template>
  </div>
</template>
