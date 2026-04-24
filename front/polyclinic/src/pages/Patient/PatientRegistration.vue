<template>
  <div class="fixed inset-0 bg-black/40 flex justify-center items-center">
    <div class="bg-white p-6 rounded-xl w-[420px] shadow-lg">
      <h2 class="text-xl font-semibold mb-4">Регистрация пациента</h2>

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

        <!-- Дата рождения -->
        <div>
          <label class="block text-sm">Дата рождения</label>
          <input
            type="date"
            v-model="form.birthDate"
            class="w-full px-3 py-2 border rounded-lg"
            :class="{ 'border-red-500': errors.birthDate }"
          />
          <p v-if="errors.birthDate" class="text-red-600 text-xs mt-1">{{ errors.birthDate }}</p>
        </div>

        <!-- Пол -->
        <div>
          <label class="block text-sm">Пол</label>
          <select v-model="form.gender" class="w-full px-3 py-2 border rounded-lg">
            <option value="MALE">Мужской</option>
            <option value="FEMALE">Женский</option>
          </select>
        </div>

        <!-- Телефон -->
        <div>
          <input
            v-model="form.phone"
            class="w-full px-3 py-2 border rounded-lg"
            :class="{ 'border-red-500': errors.phone }"
            placeholder="Телефон (9 цифр)"
          />
          <p v-if="errors.phone" class="text-red-600 text-xs mt-1">{{ errors.phone }}</p>
        </div>

        <!-- Область -->
        <div>
          <input
            v-model="form.region"
            class="w-full px-3 py-2 border rounded-lg"
            :class="{ 'border-red-500': errors.region }"
            placeholder="Область"
          />
          <p v-if="errors.region" class="text-red-600 text-xs mt-1">{{ errors.region }}</p>
        </div>

        <!-- Город -->
        <div>
          <input
            v-model="form.city"
            class="w-full px-3 py-2 border rounded-lg"
            :class="{ 'border-red-500': errors.city }"
            placeholder="Город"
          />
          <p v-if="errors.city" class="text-red-600 text-xs mt-1">{{ errors.city }}</p>
        </div>

        <!-- Улица -->
        <div>
          <input
            v-model="form.street"
            class="w-full px-3 py-2 border rounded-lg"
            :class="{ 'border-red-500': errors.street }"
            placeholder="Улица"
          />
          <p v-if="errors.street" class="text-red-600 text-xs mt-1">{{ errors.street }}</p>
        </div>

        <!-- Дом -->
        <div>
          <input
            v-model="form.houseNumber"
            class="w-full px-3 py-2 border rounded-lg"
            :class="{ 'border-red-500': errors.houseNumber }"
            placeholder="Дом"
          />
          <p v-if="errors.houseNumber" class="text-red-600 text-xs mt-1">
            {{ errors.houseNumber }}
          </p>
        </div>

        <!-- Квартира -->
        <div>
          <input
            v-model="form.apartment"
            class="w-full px-3 py-2 border rounded-lg"
            :class="{ 'border-red-500': errors.apartment }"
            placeholder="Квартира"
          />
          <p v-if="errors.apartment" class="text-red-600 text-xs mt-1">{{ errors.apartment }}</p>
        </div>

        <button class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
          Зарегистрироваться
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

<script setup>
import { ref } from 'vue'
import { patientsApi } from '@/api/patients'

const emit = defineEmits(['success', 'close'])

const form = ref({
  firstName: '',
  lastName: '',
  middleName: '',
  birthDate: '',
  gender: 'MALE', // по умолчанию
  phone: '',
  region: '',
  city: '',
  street: '',
  houseNumber: '',
  apartment: '',
})

const errors = ref({})
const serverError = ref('')

function validate() {
  errors.value = {}

  const onlyRus = /^[А-ЯЁа-яё\s-]+$/
  const onlyDigits = /^\d+$/

  if (!onlyRus.test(form.value.lastName)) errors.value.lastName = 'Только русские буквы'
  if (!onlyRus.test(form.value.firstName)) errors.value.firstName = 'Только русские буквы'
  if (form.value.middleName && !onlyRus.test(form.value.middleName))
    errors.value.middleName = 'Только русские буквы'

  if (!form.value.birthDate) errors.value.birthDate = 'Укажите дату рождения'

  if (!/^\d{9}$/.test(form.value.phone)) errors.value.phone = 'Введите 9 цифр'

  if (!onlyRus.test(form.value.region)) errors.value.region = 'Только русские буквы'
  if (!onlyRus.test(form.value.city)) errors.value.city = 'Только русские буквы'
  if (!onlyRus.test(form.value.street)) errors.value.street = 'Только русские буквы'

  if (!onlyDigits.test(form.value.houseNumber)) errors.value.houseNumber = 'Только цифры'
  if (form.value.apartment && !onlyDigits.test(form.value.apartment))
    errors.value.apartment = 'Только цифры'

  return Object.keys(errors.value).length === 0
}

async function submit() {
  serverError.value = ''
  errors.value = {}

  if (!validate()) return

  try {
    await patientsApi.register(form.value)
    emit('success')
  } catch (e) {
    const msg = e?.response?.data?.message

    if (Array.isArray(msg)) {
      msg.forEach((m) => {
        const text = m.toLowerCase()

        if (text.includes('имя')) errors.value.firstName = m
        if (text.includes('фамил')) errors.value.lastName = m
        if (text.includes('отчество')) errors.value.middleName = m
        if (text.includes('дата')) errors.value.birthDate = m
        if (text.includes('телефон')) errors.value.phone = m
        if (text.includes('область')) errors.value.region = m
        if (text.includes('город')) errors.value.city = m
        if (text.includes('улиц')) errors.value.street = m
        if (text.includes('дом')) errors.value.houseNumber = m
        if (text.includes('квартир')) errors.value.apartment = m
      })

      if (Object.keys(errors.value).length > 0) return
    }

    serverError.value = msg || 'Ошибка регистрации'
  }
}
</script>
