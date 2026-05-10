<script setup lang="ts">
import { ref } from 'vue'
import { patientsApi } from '@/api/patients'

const props = defineProps<{ patient: any }>()
const emit = defineEmits(['close', 'updated'])

const saving = ref(false)

// Backend ждёт 9 цифр телефона
const phoneDigits = props.patient.phone?.replace(/\D/g, '').slice(-9) || ''

// Backend ждёт регион БЕЗ слова "область"
const regionClean = props.patient.region?.replace(/область/i, '').trim() || ''

const form = ref({
  firstName: props.patient.firstName || '',
  lastName: props.patient.lastName || '',
  middleName: props.patient.middleName || '',
  birthDate: props.patient.birthDate?.slice(0, 10) || '',
  gender: props.patient.gender || '',
  phone: phoneDigits,
  region: regionClean,
  city: props.patient.city || '',
  street: props.patient.street || '',
  houseNumber: props.patient.houseNumber || '',
  apartment: props.patient.apartment || '',
})

async function save() {
  saving.value = true
  try {
    await patientsApi.update(props.patient.id, {
      firstName: form.value.firstName,
      lastName: form.value.lastName,
      middleName: form.value.middleName || null,
      birthDate: form.value.birthDate,
      gender: form.value.gender || null,
      phone: form.value.phone, // 9 цифр
      region: form.value.region, // backend сам добавит "область"
      city: form.value.city,
      street: form.value.street,
      houseNumber: form.value.houseNumber,
      apartment: form.value.apartment || null,
    })

    emit('updated')
  } catch (e) {
    console.error('Ошибка сохранения', e)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xl border border-teal-300">
      <h2 class="text-2xl font-bold text-teal-800 mb-4">Редактирование пациента</h2>

      <div class="space-y-3">
        <input
          v-model="form.lastName"
          class="w-full px-4 py-2 border border-teal-400 rounded-lg shadow-sm"
          placeholder="Фамилия"
        />
        <input
          v-model="form.firstName"
          class="w-full px-4 py-2 border border-teal-400 rounded-lg shadow-sm"
          placeholder="Имя"
        />
        <input
          v-model="form.middleName"
          class="w-full px-4 py-2 border border-teal-400 rounded-lg shadow-sm"
          placeholder="Отчество"
        />

        <input
          v-model="form.birthDate"
          type="date"
          class="w-full px-4 py-2 border border-teal-400 rounded-lg shadow-sm"
        />

        <select
          v-model="form.gender"
          class="w-full px-4 py-2 border border-teal-400 rounded-lg shadow-sm"
        >
          <option value="">Не выбрано</option>
          <option value="MALE">Мужской</option>
          <option value="FEMALE">Женский</option>
        </select>

        <input
          v-model="form.phone"
          maxlength="9"
          class="w-full px-4 py-2 border border-teal-400 rounded-lg shadow-sm"
          placeholder="Телефон (9 цифр)"
        />

        <input
          v-model="form.region"
          class="w-full px-4 py-2 border border-teal-400 rounded-lg shadow-sm"
          placeholder="Область (без слова 'область')"
        />

        <input
          v-model="form.city"
          class="w-full px-4 py-2 border border-teal-400 rounded-lg shadow-sm"
          placeholder="Город"
        />

        <input
          v-model="form.street"
          class="w-full px-4 py-2 border border-teal-400 rounded-lg shadow-sm"
          placeholder="Улица"
        />

        <input
          v-model="form.houseNumber"
          class="w-full px-4 py-2 border border-teal-400 rounded-lg shadow-sm"
          placeholder="Дом"
        />

        <input
          v-model="form.apartment"
          class="w-full px-4 py-2 border border-teal-400 rounded-lg shadow-sm"
          placeholder="Квартира"
        />
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <button
          class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
          @click="emit('close')"
        >
          Отмена
        </button>

        <button
          class="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-60"
          :disabled="saving"
          @click="save"
        >
          Сохранить
        </button>
      </div>
    </div>
  </div>
</template>
