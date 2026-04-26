<template>
  <div class="fixed inset-0 bg-black/40 flex justify-center items-center">
    <div class="bg-white p-6 rounded-xl w-[420px] shadow-lg">
      <h2 class="text-xl font-semibold mb-4">Редактирование профиля</h2>

      <p v-if="serverError" class="text-red-600 mb-3 text-sm">
        {{ serverError }}
      </p>

      <form @submit.prevent="submit" class="space-y-3">
        <!-- Фамилия -->
        <div>
          <input
            v-model="form.lastName"
            class="w-full px-3 py-2 border rounded-lg"
            :class="{ 'border-red-500': errors.lastName }"
            placeholder="Фамилия"
          />
          <p v-if="errors.lastName" class="text-red-600 text-xs mt-1">{{ errors.lastName }}</p>
        </div>

        <!-- Имя -->
        <div>
          <input
            v-model="form.firstName"
            class="w-full px-3 py-2 border rounded-lg"
            :class="{ 'border-red-500': errors.firstName }"
            placeholder="Имя"
          />
          <p v-if="errors.firstName" class="text-red-600 text-xs mt-1">{{ errors.firstName }}</p>
        </div>

        <!-- Отчество -->
        <div>
          <input
            v-model="form.middleName"
            class="w-full px-3 py-2 border rounded-lg"
            :class="{ 'border-red-500': errors.middleName }"
            placeholder="Отчество"
          />
          <p v-if="errors.middleName" class="text-red-600 text-xs mt-1">{{ errors.middleName }}</p>
        </div>

        <button class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
          Сохранить
        </button>

        <button
          type="button"
          class="w-full bg-gray-300 py-2 rounded-lg hover:bg-gray-400"
          @click="$emit('close')"
        >
          Отмена
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { doctorsApi } from '@/api/doctors'

const props = defineProps({
  doctor: { type: Object, required: true },
})

const emit = defineEmits(['close', 'updated'])

const form = ref({
  lastName: props.doctor.lastName,
  firstName: props.doctor.firstName,
  middleName: props.doctor.middleName,
})

const errors = ref<Record<string, string>>({})
const serverError = ref('')

function validate() {
  errors.value = {}

  const onlyRus = /^[А-ЯЁа-яё\s-]+$/

  if (!onlyRus.test(form.value.lastName)) errors.value.lastName = 'Только русские буквы'
  if (!onlyRus.test(form.value.firstName)) errors.value.firstName = 'Только русские буквы'
  if (form.value.middleName && !onlyRus.test(form.value.middleName))
    errors.value.middleName = 'Только русские буквы'

  return Object.keys(errors.value).length === 0
}

async function submit() {
  serverError.value = ''
  errors.value = {}

  if (!validate()) return

  try {
    const updated = await doctorsApi.update(props.doctor.id, form.value)
    emit('updated', updated)
  } catch (e: any) {
    const msg = e?.response?.data?.message

    if (Array.isArray(msg)) {
      msg.forEach((m) => {
        const text = m.toLowerCase()

        if (text.includes('имя')) errors.value.firstName = m
        if (text.includes('фамил')) errors.value.lastName = m
        if (text.includes('отч')) errors.value.middleName = m
      })

      if (Object.keys(errors.value).length > 0) return
    }

    serverError.value = msg || 'Ошибка сохранения'
  }
}
</script>
