<template>
  <div class="bg-white shadow-md rounded-xl p-6 border border-gray-200 w-full space-y-4">
    <!-- ФИО -->
    <div>
      <h2 class="text-2xl font-bold text-gray-800 leading-tight">
        {{ patient.lastName }} {{ patient.firstName }} {{ patient.middleName }}
      </h2>
    </div>

    <hr class="border-gray-200" />

    <!-- ОСНОВНАЯ ИНФОРМАЦИЯ -->
    <div class="space-y-1">
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

    <hr class="border-gray-200" />

    <!-- КОНТАКТЫ -->
    <div class="space-y-1">
      <h3 class="text-lg font-semibold text-gray-800">Контакты</h3>

      <p class="text-gray-700">
        <span class="font-medium">Телефон:</span>
        {{ patient.phone }}
      </p>
    </div>

    <hr class="border-gray-200" />

    <!-- АДРЕС -->
    <div class="space-y-1">
      <h3 class="text-lg font-semibold text-gray-800">Адрес</h3>

      <p class="text-gray-700 text-sm leading-tight">
        {{ patient.region }}, {{ patient.city }}, {{ patient.street }} {{ patient.houseNumber }}
        <span v-if="patient.apartment">, кв. {{ patient.apartment }}</span>
      </p>
    </div>

    <hr class="border-gray-200" />

    <!-- ТЕРАПЕВТ -->
    <div class="space-y-2">
      <div class="flex items-center gap-2">
        <h3 class="text-lg font-semibold text-gray-800">Терапевт</h3>

        <button
          v-if="patient.primaryTherapist"
          @click="openDoctor"
          class="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
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
</template>

<script setup>
import { useRouter } from 'vue-router'
import { formatGender } from '@/api/gender'

const props = defineProps({
  patient: Object,
})

const router = useRouter()

function formatDate(date) {
  return new Date(date).toLocaleDateString('ru-RU')
}

function openDoctor() {
  router.push(`/doctors/${props.patient.primaryTherapist.id}`)
}
</script>
