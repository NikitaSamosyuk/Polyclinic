<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { doctorsApi } from '@/api/doctors'
import { cabinetsApi } from '@/api/cabinets'
import { useAuthStore } from '@/store/auth.store'

const props = defineProps<{ doctor: any }>()
const emit = defineEmits(['close', 'updated'])

const auth = useAuthStore()
const isAdmin = auth.user?.role === 'ADMIN'

const form = ref({
  firstName: props.doctor.firstName,
  lastName: props.doctor.lastName,
  middleName: props.doctor.middleName,
  specialization: props.doctor.specialization,
  isTherapist: props.doctor.isTherapist,
  cabinetNumber: props.doctor.cabinet?.number || '',
  phone: props.doctor.phone,
})

const cabinets = ref<any[]>([])

async function loadCabinets() {
  cabinets.value = await cabinetsApi.getAll()
}

onMounted(loadCabinets)

const canEditFull = computed(() => isAdmin)

async function save() {
  const dto: any = {
    firstName: form.value.firstName,
    lastName: form.value.lastName,
    middleName: form.value.middleName,
  }

  if (canEditFull.value) {
    dto.specialization = form.value.specialization
    dto.isTherapist = form.value.isTherapist
    dto.phone = form.value.phone

    // кабинет по номеру
    const cab = cabinets.value.find((c) => c.number === form.value.cabinetNumber)
    dto.cabinetId = cab ? cab.id : null
  }

  await doctorsApi.update(props.doctor.id, dto)
  emit('updated')
  emit('close')
}
</script>

<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white p-8 rounded-xl shadow-xl w-full max-w-lg space-y-6">
      <h2 class="text-2xl font-bold text-teal-800">Редактировать врача</h2>

      <div class="space-y-4">
        <input
          v-model="form.lastName"
          class="w-full px-4 py-2 border rounded-lg"
          placeholder="Фамилия"
        />
        <input
          v-model="form.firstName"
          class="w-full px-4 py-2 border rounded-lg"
          placeholder="Имя"
        />
        <input
          v-model="form.middleName"
          class="w-full px-4 py-2 border rounded-lg"
          placeholder="Отчество"
        />

        <template v-if="canEditFull">
          <input
            v-model="form.specialization"
            class="w-full px-4 py-2 border rounded-lg"
            placeholder="Специализация"
          />

          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="form.isTherapist" class="w-4 h-4 accent-teal-600" />
            <span>Терапевт</span>
          </label>

          <select v-model="form.cabinetNumber" class="w-full px-4 py-2 border rounded-lg">
            <option value="">Без кабинета</option>
            <option v-for="c in cabinets" :key="c.id" :value="c.number">
              Кабинет №{{ c.number }}
            </option>
          </select>

          <input
            v-model="form.phone"
            class="w-full px-4 py-2 border rounded-lg"
            placeholder="Телефон"
          />
        </template>
      </div>

      <div class="flex justify-end gap-3">
        <button class="px-4 py-2 bg-gray-300 rounded" @click="emit('close')">Отмена</button>
        <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="save">Сохранить</button>
      </div>
    </div>
  </div>
</template>
