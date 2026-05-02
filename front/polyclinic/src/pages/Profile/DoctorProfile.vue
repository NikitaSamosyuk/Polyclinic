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

const form = ref({
  lastName: props.doctor.lastName,
  firstName: props.doctor.firstName,
  middleName: props.doctor.middleName,
})

/*  
  Если doctor обновился, но мы НЕ редактируем — обновляем форму.
*/
watch(
  () => props.doctor,
  (d) => {
    if (!d) return
    if (!isEditing.value) {
      form.value = {
        lastName: d.lastName,
        firstName: d.firstName,
        middleName: d.middleName,
      }
    }
  },
  { deep: true }
)

function startEdit() {
  isEditing.value = true
  errorPhoto.value = null
}

function cancelEdit() {
  isEditing.value = false
  errorPhoto.value = null
}

async function save() {
  if (!props.doctor?.id) return

  try {
    await doctorsApi.update(props.doctor.id, form.value)
    const fresh = await doctorsApi.getById(props.doctor.id)
    emit('updated', fresh)
    isEditing.value = false
  } catch (e) {
    console.error('Ошибка сохранения профиля врача:', e)
  }
}

async function onPhotoClick() {
  if (!isEditing.value) return
  if (!props.doctor?.id) return

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

      // Обновляем только фото, не сбрасывая форму
      emit('updated', {
        ...props.doctor,
        photoUrl: updated.photoUrl,
      })
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
  <div class="bg-white border border-teal-300 rounded-2xl shadow p-6 space-y-6">
    <h2 class="text-3xl font-bold text-teal-800">Профиль врача</h2>

    <div class="flex flex-col md:flex-row gap-10">
      <!-- Фото врача -->
      <div class="flex flex-col items-center gap-3">
        <div
          class="overflow-hidden rounded-xl bg-gray-100 border border-teal-300 shadow cursor-pointer"
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
      <div class="flex-1 space-y-6">
        <!-- ФИО врача -->
        <div class="flex items-start gap-3">
          <img src="@/assets/profile-doctor-icon.png" class="w-7 h-7 object-contain" />

          <div class="flex-1 space-y-3">
            <!-- Фамилия -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Фамилия</label>
              <input
                v-if="isEditing"
                v-model="form.lastName"
                class="w-full px-4 py-3 border border-teal-400 rounded-lg shadow-sm"
              />
              <p v-else class="text-gray-900 text-lg font-semibold">
                {{ doctor.lastName }}
              </p>
            </div>

            <!-- Имя -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Имя</label>
              <input
                v-if="isEditing"
                v-model="form.firstName"
                class="w-full px-4 py-3 border border-teal-400 rounded-lg shadow-sm"
              />
              <p v-else class="text-gray-900 text-lg font-semibold">
                {{ doctor.firstName }}
              </p>
            </div>

            <!-- Отчество -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Отчество</label>
              <input
                v-if="isEditing"
                v-model="form.middleName"
                class="w-full px-4 py-3 border border-teal-400 rounded-lg shadow-sm"
              />
              <p v-else class="text-gray-900 text-lg font-semibold">
                {{ doctor.middleName }}
              </p>
            </div>
          </div>
        </div>

        <!-- Специализация -->
        <div class="flex items-start gap-3">
          <img src="@/assets/doctor-icon.png" class="w-7 h-7 object-contain" />
          <p class="text-gray-900 text-lg font-medium">
            <b>Специализация:</b> {{ doctor.specialization }}
          </p>
        </div>

        <!-- Кабинет -->
        <div class="flex items-start gap-3">
          <img src="@/assets/cabinet-icon.png" class="w-7 h-7 object-contain" />
          <p class="text-gray-900 text-lg font-medium">
            <b>Кабинет:</b>
            <span v-if="doctor.cabinet">№{{ doctor.cabinet.number }}</span>
            <span v-else>Не назначен</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Кнопки -->
    <div class="flex gap-3 pt-4">
      <button
        v-if="!isEditing"
        class="w-full bg-blue-600 text-white py-3 rounded-lg shadow hover:bg-blue-700 transition"
        @click="startEdit"
      >
        Редактировать
      </button>

      <template v-else>
        <button
          class="w-full bg-green-600 text-white py-3 rounded-lg shadow hover:bg-green-700 transition"
          @click="save"
        >
          Сохранить
        </button>

        <button
          class="w-full bg-gray-200 text-gray-800 py-3 rounded-lg shadow hover:bg-gray-300 transition"
          @click="cancelEdit"
        >
          Отмена
        </button>
      </template>
    </div>
  </div>
</template>
