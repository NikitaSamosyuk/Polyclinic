<template>
  <div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
    <div class="bg-white border border-teal-300 rounded-2xl shadow-xl w-full max-w-lg p-6">
      <h2 class="text-2xl font-bold text-teal-800 mb-4 text-center">Регистрация пациента</h2>

      <p v-if="serverError" class="text-red-600 mb-3 text-sm text-center">
        {{ serverError }}
      </p>

      <form @submit.prevent="submit" class="space-y-4">
        <!-- ФИО -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              v-model="form.lastName"
              class="w-full px-4 py-3 border border-teal-400 rounded-lg shadow-sm"
              :class="{ 'border-red-500': errors.lastName }"
              placeholder="Фамилия"
            />
            <p v-if="errors.lastName" class="text-red-600 text-xs mt-1">{{ errors.lastName }}</p>
          </div>

          <div>
            <input
              v-model="form.firstName"
              class="w-full px-4 py-3 border border-teal-400 rounded-lg shadow-sm"
              :class="{ 'border-red-500': errors.firstName }"
              placeholder="Имя"
            />
            <p v-if="errors.firstName" class="text-red-600 text-xs mt-1">{{ errors.firstName }}</p>
          </div>

          <div class="md:col-span-2">
            <input
              v-model="form.middleName"
              class="w-full px-4 py-3 border border-teal-400 rounded-lg shadow-sm"
              :class="{ 'border-red-500': errors.middleName }"
              placeholder="Отчество"
            />
            <p v-if="errors.middleName" class="text-red-600 text-xs mt-1">
              {{ errors.middleName }}
            </p>
          </div>
        </div>

        <!-- Дата рождения + Пол -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm mb-1 text-gray-700">Дата рождения</label>
            <input
              type="date"
              v-model="form.birthDate"
              class="w-full px-4 py-3 border border-teal-400 rounded-lg shadow-sm"
              :class="{ 'border-red-500': errors.birthDate }"
            />
            <p v-if="errors.birthDate" class="text-red-600 text-xs mt-1">
              {{ errors.birthDate }}
            </p>
          </div>

          <div>
            <label class="block text-sm mb-1 text-gray-700">Пол</label>
            <select
              v-model="form.gender"
              class="w-full px-4 py-3 border border-teal-400 rounded-lg shadow-sm bg-white"
            >
              <option value="MALE">Мужской</option>
              <option value="FEMALE">Женский</option>
            </select>
          </div>
        </div>

        <!-- Телефон -->
        <div>
          <input
            v-model="form.phone"
            class="w-full px-4 py-3 border border-teal-400 rounded-lg shadow-sm"
            :class="{ 'border-red-500': errors.phone }"
            placeholder="Телефон (9 цифр)"
          />
          <p v-if="errors.phone" class="text-red-600 text-xs mt-1">{{ errors.phone }}</p>
        </div>

        <!-- Адрес -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              v-model="form.region"
              class="w-full px-4 py-3 border border-teal-400 rounded-lg shadow-sm"
              :class="{ 'border-red-500': errors.region }"
              placeholder="Область"
            />
            <p v-if="errors.region" class="text-red-600 text-xs mt-1">{{ errors.region }}</p>
          </div>

          <div>
            <input
              v-model="form.city"
              class="w-full px-4 py-3 border border-teal-400 rounded-lg shadow-sm"
              :class="{ 'border-red-500': errors.city }"
              placeholder="Город"
            />
            <p v-if="errors.city" class="text-red-600 text-xs mt-1">{{ errors.city }}</p>
          </div>

          <div>
            <input
              v-model="form.street"
              class="w-full px-4 py-3 border border-teal-400 rounded-lg shadow-sm"
              :class="{ 'border-red-500': errors.street }"
              placeholder="Улица"
            />
            <p v-if="errors.street" class="text-red-600 text-xs mt-1">{{ errors.street }}</p>
          </div>

          <div>
            <input
              v-model="form.houseNumber"
              class="w-full px-4 py-3 border border-teal-400 rounded-lg shadow-sm"
              :class="{ 'border-red-500': errors.houseNumber }"
              placeholder="Дом"
            />
            <p v-if="errors.houseNumber" class="text-red-600 text-xs mt-1">
              {{ errors.houseNumber }}
            </p>
          </div>

          <div class="md:col-span-2">
            <input
              v-model="form.apartment"
              class="w-full px-4 py-3 border border-teal-400 rounded-lg shadow-sm"
              :class="{ 'border-red-500': errors.apartment }"
              placeholder="Квартира"
            />
            <p v-if="errors.apartment" class="text-red-600 text-xs mt-1">
              {{ errors.apartment }}
            </p>
          </div>
        </div>

        <!-- Кнопки -->
        <div class="space-y-3 pt-2">
          <button
            class="w-full bg-green-600 text-white py-3 rounded-lg shadow hover:bg-green-700 transition"
          >
            Зарегистрироваться
          </button>

          <button
            type="button"
            class="w-full bg-gray-200 text-gray-800 py-3 rounded-lg shadow hover:bg-gray-300 transition"
            @click="$emit('close')"
          >
            Отмена
          </button>
        </div>
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
  gender: 'MALE',
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

  // Фамилия
  if (!form.value.lastName) errors.value.lastName = 'Введите фамилию'
  else if (!onlyRus.test(form.value.lastName)) errors.value.lastName = 'Только русские буквы'

  // Имя
  if (!form.value.firstName) errors.value.firstName = 'Введите имя'
  else if (!onlyRus.test(form.value.firstName)) errors.value.firstName = 'Только русские буквы'

  // Отчество
  if (form.value.middleName && !onlyRus.test(form.value.middleName))
    errors.value.middleName = 'Только русские буквы'

  // Дата рождения
  if (!form.value.birthDate) errors.value.birthDate = 'Укажите дату рождения'

  // Телефон
  if (!form.value.phone) errors.value.phone = 'Введите телефон'
  else if (!/^\d{9}$/.test(form.value.phone)) errors.value.phone = 'Введите 9 цифр'

  // Область
  if (!form.value.region) errors.value.region = 'Введите область'
  else if (!onlyRus.test(form.value.region)) errors.value.region = 'Только русские буквы'

  // Город
  if (!form.value.city) errors.value.city = 'Введите город'
  else if (!onlyRus.test(form.value.city)) errors.value.city = 'Только русские буквы'

  // Улица
  if (!form.value.street) errors.value.street = 'Введите улицу'
  else if (!onlyRus.test(form.value.street)) errors.value.street = 'Только русские буквы'

  // Дом
  if (!form.value.houseNumber) errors.value.houseNumber = 'Введите дом'
  else if (!onlyDigits.test(form.value.houseNumber)) errors.value.houseNumber = 'Только цифры'

  // Квартира
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
