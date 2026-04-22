<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth.store'
import { usersApi } from '@/api/users'

import DoctorProfile from '@/pages/Profile/DoctorProfile.vue'
import PatientProfile from '@/pages/Profile/PatientProfile.vue'
import AdminProfile from '@/pages/Profile/AdminProfile.vue'

const auth = useAuthStore()

const loading = ref(true)
const avatar = ref('')

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
    } else {
      avatar.value = ''
    }
  } catch {
    avatar.value = ''
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

const roleComponent = computed(() => {
  switch (auth.user?.role) {
    case 'DOCTOR':
      return DoctorProfile
    case 'PATIENT':
      return PatientProfile
    case 'ADMIN':
      return AdminProfile
    default:
      return null
  }
})

onMounted(async () => {
  console.log('[PROFILE] mounted, user:', auth.user)
  if (auth.user) {
    await loadAvatar()
  }
  loading.value = false
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
    <div v-if="loading" class="text-gray-600 text-lg">Загрузка...</div>

    <template v-else>
      <div
        v-if="auth.user"
        class="w-full max-w-xl bg-white shadow-md rounded-xl p-6 flex items-center gap-6"
      >
        <div
          class="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center cursor-pointer"
          @click="onAvatarClick"
        >
          <img v-if="avatar" :src="avatar" class="w-full h-full object-cover" />
          <span v-else class="text-gray-500 text-3xl font-bold">
            {{ auth.user.username[0].toUpperCase() }}
          </span>
        </div>

        <div class="flex-1">
          <h2 class="text-2xl font-semibold text-gray-800">
            {{ auth.user.username }}
          </h2>
          <p class="text-gray-600 text-lg">{{ auth.user.email }}</p>

          <div class="mt-4 flex gap-3 flex-wrap">
            <button
              @click="startEdit"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Редактировать
            </button>

            <button
              v-if="editing"
              @click="startChangePassword"
              class="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
            >
              Сменить пароль
            </button>

            <button
              @click="auth.logout()"
              class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Выйти
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="auth.user && editing"
        class="w-full max-w-xl bg-white shadow-md rounded-xl p-6 mt-6 space-y-3"
      >
        <input
          v-model="form.username"
          class="w-full px-4 py-2 border rounded-lg"
          placeholder="Имя"
        />
        <input
          v-model="form.email"
          class="w-full px-4 py-2 border rounded-lg"
          placeholder="Email"
        />

        <button
          @click="saveProfile"
          class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
        >
          Сохранить
        </button>
      </div>

      <div
        v-if="auth.user && changingPassword"
        class="w-full max-w-xl bg-white shadow-md rounded-xl p-6 mt-6 space-y-3"
      >
        <input
          v-model="passwordForm.current"
          type="password"
          class="w-full px-4 py-2 border rounded-lg"
          placeholder="Текущий пароль"
        />

        <input
          v-model="passwordForm.new"
          type="password"
          class="w-full px-4 py-2 border rounded-lg"
          placeholder="Новый пароль"
        />

        <button
          @click="changePassword"
          class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Изменить пароль
        </button>
      </div>

      <p v-if="msg" class="mt-4 text-center text-gray-700">{{ msg }}</p>

      <div v-if="auth.user && roleComponent" class="w-full max-w-3xl mt-10">
        <component :is="roleComponent" />
      </div>

      <!-- если вдруг user = null, но мы всё-таки тут -->
      <div v-if="!auth.user" class="mt-10 text-gray-600">
        Профиль недоступен. Попробуй войти заново.
      </div>
    </template>
  </div>
</template>
