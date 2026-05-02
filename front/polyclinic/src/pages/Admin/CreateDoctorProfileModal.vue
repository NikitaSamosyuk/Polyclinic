<script setup lang="ts">
import { ref } from 'vue'
import { doctorsApi } from '@/api/doctors'
import { cabinetsApi } from '@/api/cabinets'

const props = defineProps<{
  userId: number | null
}>()

const emit = defineEmits(['close', 'created'])

const form = ref({
  lastName: '',
  firstName: '',
  middleName: '',
  specialization: '',
  phone: '',
  cabinetId: null as number | null,
})

const cabinets = ref([])
const loading = ref(false)
const error = ref<string | null>(null)

async function loadCabinets() {
  cabinets.value = await cabinetsApi.getAll()
}

async function createDoctor() {
  if (!props.userId) {
    error.value = 'Ошибка: userId отсутствует'
    return
  }

  loading.value = true
  error.value = null

  try {
    await doctorsApi.create({
      userId: props.userId,
      ...form.value,
    })

    emit('created')
    emit('close')
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Ошибка создания врача'
  } finally {
    loading.value = false
  }
}

loadCabinets()
</script>

<template>
  <div
    class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
    @click.self="emit('close')"
  >
    <div class="bg-white w-full max-w-xl rounded-xl shadow-xl p-8 space-y-6">
      <h2 class="text-2xl font-bold text-teal-700">Создание профиля врача</h2>

      <div class="space-y-4">
        <input v-model="form.lastName" class="input" placeholder="Фамилия" />
        <input v-model="form.firstName" class="input" placeholder="Имя" />
        <input v-model="form.middleName" class="input" placeholder="Отчество" />
        <input v-model="form.specialization" class="input" placeholder="Специализация" />
        <input v-model="form.phone" class="input" placeholder="Телефон" />

        <select v-model="form.cabinetId" class="input">
          <option :value="null">Без кабинета</option>
          <option v-for="c in cabinets" :key="c.id" :value="c.id">Кабинет №{{ c.number }}</option>
        </select>

        <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
      </div>

      <div class="flex justify-end gap-3">
        <button class="btn-gray" @click="emit('close')">Отмена</button>
        <button class="btn-teal" @click="createDoctor" :disabled="loading">
          {{ loading ? 'Создание...' : 'Создать' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input {
  width: 100%;
  padding: 10px;
  border: 1px solid #0d9488;
  border-radius: 8px;
}
.btn-gray {
  padding: 10px 16px;
  background: #e5e7eb;
  border-radius: 8px;
}
.btn-teal {
  padding: 10px 16px;
  background: #0d9488;
  color: white;
  border-radius: 8px;
}
</style>
