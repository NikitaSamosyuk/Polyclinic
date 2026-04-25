<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'

const props = defineProps({
  mode: String,
  zone: Object,
})

const emit = defineEmits(['close', 'saved'])

const doctors = ref([])
const serverError = ref('')

const form = ref({
  doctorId: '',
  street: '',
})

const housesInput = ref('')

async function loadDoctors() {
  try {
    const res = await api.get('/doctors')
    doctors.value = res.data.filter((d) => d.isTherapist)
  } catch (e) {
    serverError.value = e?.response?.data?.message || 'Ошибка загрузки врачей'
  }
}

onMounted(() => {
  loadDoctors()

  if (props.mode === 'edit' && props.zone) {
    form.value.doctorId = props.zone.doctorId
    form.value.street = props.zone.street
    housesInput.value = props.zone.houses.join(', ')
  }
})

async function submit() {
  serverError.value = ''

  const payload = {
    street: form.value.street.trim().toLowerCase(),
    houses: housesInput.value.split(',').map((h) => h.trim().toLowerCase()),
  }

  try {
    let result

    if (props.mode === 'create') {
      result = await api.post('/therapist-zones', {
        doctorId: Number(form.value.doctorId),
        ...payload,
      })
    } else {
      result = await api.patch(`/therapist-zones/${props.zone.id}`, payload)
    }

    emit('saved', result.data)
  } catch (e) {
    serverError.value = e?.response?.data?.message || 'Ошибка сохранения'
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center">
    <div class="bg-white p-6 rounded-xl w-[480px] shadow max-h-[90vh] overflow-y-auto">
      <h2 class="text-xl font-semibold mb-4">
        {{ mode === 'create' ? 'Создание зоны' : 'Редактирование зоны' }}
      </h2>

      <p v-if="serverError" class="text-red-600 mb-3 text-sm">{{ serverError }}</p>

      <form @submit.prevent="submit" class="space-y-4">
        <!-- ВРАЧ -->
        <div>
          <label class="block text-sm font-medium mb-1">Терапевт</label>
          <select
            v-model="form.doctorId"
            class="w-full border px-3 py-2 rounded-lg"
            :disabled="mode === 'edit'"
          >
            <option disabled value="">Выберите врача</option>
            <option v-for="d in doctors" :key="d.id" :value="d.id">
              {{ d.lastName }} {{ d.firstName }}
            </option>
          </select>
        </div>

        <!-- УЛИЦА -->
        <div>
          <label class="block text-sm font-medium mb-1">Улица</label>
          <input
            v-model="form.street"
            class="w-full border px-3 py-2 rounded-lg"
            placeholder="ленина"
          />
        </div>

        <!-- ДОМА -->
        <div>
          <label class="block text-sm font-medium mb-1">Дома (через запятую)</label>
          <input
            v-model="housesInput"
            class="w-full border px-3 py-2 rounded-lg"
            placeholder="10, 12, 5-20"
          />
        </div>

        <div class="flex gap-3 pt-4">
          <button class="flex-1 bg-blue-600 text-white py-2 rounded-lg">Сохранить</button>

          <button type="button" @click="$emit('close')" class="flex-1 bg-gray-300 py-2 rounded-lg">
            Отмена
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
