<script setup lang="ts">
import { ref } from 'vue'
import { doctorsApi } from '@/api/doctors'

const props = defineProps<{ userId: number | null }>()
const emit = defineEmits(['close', 'created'])

const form = ref({
  userId: props.userId!,
  lastName: '',
  firstName: '',
  middleName: '',
  specialization: '',
  isTherapist: false,
  cabinetId: null as number | null,
  photoUrl: null as string | null,
})

const errors = ref<Record<string, string>>({})
const serverError = ref('')

async function submit() {
  errors.value = {}
  serverError.value = ''

  if (!form.value.lastName) errors.value.lastName = 'Фамилия обязательна'
  if (!form.value.firstName) errors.value.firstName = 'Имя обязательно'
  if (!form.value.specialization) errors.value.specialization = 'Специализация обязательна'

  if (Object.keys(errors.value).length > 0) return

  try {
    await doctorsApi.create(form.value)
    emit('created')
  } catch (e: any) {
    serverError.value = e?.response?.data?.message || 'Ошибка создания врача'
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black/40 flex justify-center items-center">
    <div class="bg-white p-6 rounded-xl w-[420px] shadow-lg">
      <h2 class="text-xl font-semibold mb-4">Создание профиля врача</h2>

      <p v-if="serverError" class="text-red-600 mb-3 text-sm">{{ serverError }}</p>

      <div class="space-y-3">
        <input
          v-model="form.lastName"
          class="w-full px-3 py-2 border rounded-lg"
          placeholder="Фамилия"
        />
        <input
          v-model="form.firstName"
          class="w-full px-3 py-2 border rounded-lg"
          placeholder="Имя"
        />
        <input
          v-model="form.middleName"
          class="w-full px-3 py-2 border rounded-lg"
          placeholder="Отчество"
        />
        <input
          v-model="form.specialization"
          class="w-full px-3 py-2 border rounded-lg"
          placeholder="Специализация"
        />

        <button
          class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
          @click="submit"
        >
          Создать врача
        </button>

        <button
          class="w-full bg-gray-300 py-2 rounded-lg hover:bg-gray-400"
          @click="$emit('close')"
        >
          Отмена
        </button>
      </div>
    </div>
  </div>
</template>
