<template>
  <div class="bg-white border border-teal-300 rounded-2xl shadow p-6 space-y-6 w-full">
    <!-- ФИО + кнопки админа -->
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-start gap-3">
        <img src="@/assets/patient-icon.png" class="w-7 h-7 object-contain" />
        <div>
          <h2 class="text-2xl font-bold text-teal-800 leading-tight">
            {{ patient.lastName }} {{ patient.firstName }} {{ patient.middleName }}
          </h2>

          <!-- ID пациента — только админу -->
          <p v-if="isAdmin" class="text-sm text-gray-600 mt-1">
            <span class="font-medium">ID пациента:</span> {{ patient.id }}
          </p>

          <!-- Почта — только админу -->
          <p v-if="isAdmin" class="text-sm text-gray-600 mt-1">
            <span class="font-medium">Почта:</span> {{ patient.user?.email || '—' }}
          </p>
        </div>
      </div>

      <div v-if="isAdmin" class="flex flex-col gap-2">
        <button
          class="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow"
          @click="$emit('edit', patient)"
        >
          Редактировать
        </button>

        <button
          v-if="patient.user?.isActive"
          class="px-3 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 shadow"
          @click="$emit('deactivate', patient)"
        >
          Деактивировать
        </button>

        <button
          v-else
          class="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 shadow"
          @click="$emit('activate', patient)"
        >
          Активировать
        </button>
      </div>
    </div>

    <hr class="border-gray-200" />

    <!-- Основная информация -->
    <div class="space-y-3">
      <div class="flex items-start gap-3">
        <img src="@/assets/info-icon.png" class="w-6 h-6 object-contain opacity-80" />
        <div class="flex-1 space-y-1">
          <h3 class="text-lg font-semibold text-gray-800">Основная информация</h3>

          <p class="text-gray-700">
            <span class="font-medium">Дата рождения:</span>
            {{ formatDate(patient.birthDate) }}
          </p>

          <p class="text-gray-700">
            <span class="font-medium">Пол:</span>
            {{ formatGender(patient.gender) }}
          </p>

          <p class="text-gray-700">
            <span class="font-medium">Мед. карта:</span>
            {{ patient.medicalCardNumber || '—' }}
          </p>
        </div>
      </div>
    </div>

    <hr class="border-gray-200" />

    <!-- Контакты -->
    <div class="space-y-3">
      <div class="flex items-start gap-3">
        <img src="@/assets/phone-icon.png" class="w-6 h-6 object-contain opacity-80" />
        <div class="flex-1 space-y-1">
          <h3 class="text-lg font-semibold text-gray-800">Контакты</h3>

          <p class="text-gray-700">
            <span class="font-medium">Телефон:</span>
            {{ patient.phone }}
          </p>

          <p v-if="isAdmin" class="text-gray-700">
            <span class="font-medium">Почта:</span>
            {{ patient.user?.email || '—' }}
          </p>
        </div>
      </div>
    </div>

    <hr class="border-gray-200" />

    <!-- Адрес -->
    <div class="space-y-3">
      <div class="flex items-start gap-3">
        <img src="@/assets/address-icon.png" class="w-6 h-6 object-contain opacity-80" />
        <div class="flex-1 space-y-1">
          <h3 class="text-lg font-semibold text-gray-800">Адрес</h3>
          <p class="text-gray-700 leading-tight">
            {{ patient.region }}, {{ patient.city }}, {{ patient.street }} {{ patient.houseNumber }}
            <span v-if="patient.apartment">, кв. {{ patient.apartment }}</span>
          </p>
        </div>
      </div>
    </div>

    <hr class="border-gray-200" />

    <!-- Терапевт -->
    <div class="space-y-3">
      <div class="flex items-start gap-3">
        <img src="@/assets/profile-doctor-icon.png" class="w-7 h-7 object-contain" />
        <div class="flex-1 space-y-2">
          <div class="flex items-center gap-3">
            <h3 class="text-lg font-semibold text-gray-800">Терапевт</h3>

            <button
              v-if="patient.primaryTherapist"
              @click.stop="$emit('open-doctor', patient.primaryTherapist)"
              class="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow"
            >
              Открыть
            </button>
          </div>

          <p class="text-gray-700">
            <template v-if="patient.primaryTherapist">
              {{ patient.primaryTherapist.lastName }}
              {{ patient.primaryTherapist.firstName }}
              <span v-if="patient.primaryTherapist.middleName">
                {{ patient.primaryTherapist.middleName }}
              </span>
            </template>
            <span v-else>Не назначен</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatGender } from '@/api/gender'

defineProps({
  patient: Object,
  isAdmin: Boolean,
})

defineEmits(['open-doctor', 'edit', 'deactivate', 'activate'])

function formatDate(date) {
  return new Date(date).toLocaleDateString('ru-RU')
}
</script>
