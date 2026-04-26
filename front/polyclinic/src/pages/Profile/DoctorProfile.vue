<script setup lang="ts">
import { ref, watch } from 'vue'
import { doctorsApi } from '@/api/doctors'

const props = defineProps<{
  doctor: any
}>()

const emit = defineEmits(['updated'])

const isEditing = ref(false)
const loadingPhoto = ref(false)
const errorPhoto = ref<string | null>(null)

const base = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

/*  
  ВАЖНО:
  Когда doctor обновляется через @updated — 
  мы должны обновить форму, иначе будут старые данные.
*/
const form = ref({
  lastName: props.doctor.lastName,
  firstName: props.doctor.firstName,
  middleName: props.doctor.middleName,
})

watch(
  () => props.doctor,
  (d) => {
    if (!d) return
    form.value = {
      lastName: d.lastName,
      firstName: d.firstName,
      middleName: d.middleName,
    }
  },
  { deep: true }
)

function startEdit() {
  isEditing.value = true
  form.value = {
    lastName: props.doctor.lastName,
    firstName: props.doctor.firstName,
    middleName: props.doctor.middleName,
  }
}

function cancelEdit() {
  isEditing.value = false
  errorPhoto.value = null
}

async function save() {
  if (!props.doctor?.id) return

  try {
    await doctorsApi.update(props.doctor.id, form.value)

    // Загружаем врача заново, чтобы cabinet, specialization и т.д. были актуальны
    const fresh = await doctorsApi.getById(props.doctor.id)

    emit('updated', fresh)
    isEditing.value = false
  } catch (e) {
    console.error('Ошибка сохранения профиля врача:', e)
  }
}

async function onPhotoClick() {
  if (!isEditing.value) return
  if (!props.doctor?.id) {
    console.error('❌ doctor.id отсутствует при загрузке фото:', props.doctor)
    return
  }

  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'

  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('photo', file)

    loadingPhoto.value = true
    errorPhoto.value = null

    try {
      const updated = await doctorsApi.uploadPhoto(formData)
      emit('updated', updated)
    } catch (err: any) {
      errorPhoto.value = err?.response?.data?.message || 'Ошибка загрузки фото'
    } finally {
      loadingPhoto.value = false
    }
  }

  input.click()
}
</script>

<template>
  <div class="bg-white shadow-md rounded-xl p-6">
    <h2 class="text-xl font-semibold mb-4">Профиль врача</h2>

    <div class="flex gap-6">
      <!-- Фото врача -->
      <div class="flex flex-col items-center gap-2">
        <div
          class="overflow-hidden rounded-md bg-gray-100 flex justify-center items-center border cursor-pointer"
          style="width: 260px; height: 360px"
          @click="onPhotoClick"
        >
          <img
            :src="doctor.photoUrl ? base + doctor.photoUrl : base + '/uploads/defaults/doctor.png'"
            class="h-full w-auto object-cover"
          />
        </div>

        <p v-if="loadingPhoto" class="text-xs text-gray-500">Загрузка фото...</p>
        <p v-if="errorPhoto" class="text-xs text-red-600">{{ errorPhoto }}</p>

        <p v-if="isEditing" class="text-xs text-blue-600">Нажмите на фото, чтобы изменить</p>
      </div>

      <!-- Информация -->
      <div class="flex-1 space-y-3">
        <!-- Фамилия -->
        <div>
          <label class="block text-sm font-medium">Фамилия</label>
          <input
            v-if="isEditing"
            v-model="form.lastName"
            class="w-full px-3 py-2 border rounded-lg"
          />
          <p v-else>{{ doctor.lastName }}</p>
        </div>

        <!-- Имя -->
        <div>
          <label class="block text-sm font-medium">Имя</label>
          <input
            v-if="isEditing"
            v-model="form.firstName"
            class="w-full px-3 py-2 border rounded-lg"
          />
          <p v-else>{{ doctor.firstName }}</p>
        </div>

        <!-- Отчество -->
        <div>
          <label class="block text-sm font-medium">Отчество</label>
          <input
            v-if="isEditing"
            v-model="form.middleName"
            class="w-full px-3 py-2 border rounded-lg"
          />
          <p v-else>{{ doctor.middleName }}</p>
        </div>

        <!-- Имя -->
        <div>
          <label class="block text-sm font-medium">Имя</label>
          <input
            v-if="isEditing"
            v-model="form.firstName"
            class="w-full px-3 py-2 border rounded-lg"
          />
          <p v-else>{{ doctor.firstName }}</p>
        </div>

        <!-- Отчество -->
        <div>
          <label class="block text-sm font-medium">Отчество</label>
          <input
            v-if="isEditing"
            v-model="form.middleName"
            class="w-full px-3 py-2 border rounded-lg"
          />
          <p v-else>{{ doctor.middleName }}</p>
        </div>

        <p><strong>Специализация:</strong> {{ doctor.specialization }}</p>

        <p>
          <strong>Кабинет:</strong>
          <span v-if="doctor.cabinet">№{{ doctor.cabinet.number }}</span>
          <span v-else>Не назначен</span>
        </p>
      </div>
    </div>

    <!-- Кнопки -->
    <div class="mt-6 flex gap-3">
      <button
        v-if="!isEditing"
        class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        @click="startEdit"
      >
        Редактировать
      </button>

      <template v-else>
        <button
          class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
          @click="save"
        >
          Сохранить
        </button>

        <button class="w-full bg-gray-300 py-2 rounded-lg hover:bg-gray-400" @click="cancelEdit">
          Отмена
        </button>
      </template>
    </div>
  </div>
</template>
