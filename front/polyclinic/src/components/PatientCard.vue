```vue
<template>
  <div class="patient-card">
    <div v-if="loading" class="loading">Загрузка пациента...</div>

    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else-if="patientData">
      <h3 class="name">
        {{ patientData.lastName }} {{ patientData.firstName }}
        <span v-if="patientData.middleName"> {{ patientData.middleName }}</span>
      </h3>

      <p><strong>Дата рождения:</strong> {{ formatDate(patientData.birthDate) }}</p>
      <p v-if="patientData.gender"><strong>Пол:</strong> {{ patientData.gender }}</p>
      <p v-if="patientData.phone"><strong>Телефон:</strong> {{ patientData.phone }}</p>
      <p v-if="patientData.address"><strong>Адрес:</strong> {{ patientData.address }}</p>
      <p v-if="patientData.medicalCardNumber">
        <strong>№ мед. карты:</strong> {{ patientData.medicalCardNumber }}
      </p>

      <div class="meta">
        <small>Создан: {{ formatDate(patientData.createdAt) }}</small>
      </div>
    </div>

    <div v-else class="empty">Нет данных пациента</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { patientsApi } from '../api/patients'

const props = defineProps<{
  patient?: any
}>()

const route = useRoute()
const loading = ref(false)
const error = ref<string | null>(null)
const fetched = ref<any | null>(null)

const patientData = computed(() => props.patient ?? fetched.value)

function formatDate(dateStr: string | undefined | null) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('ru-RU')
  } catch {
    return String(dateStr)
  }
}

async function loadPatient(userId: number) {
  loading.value = true
  error.value = null
  fetched.value = null

  try {
    const res = await patientsApi.getByUserId(userId)
    fetched.value = res
  } catch (err: any) {
    console.error('Error loading patient', err)
    if (err?.response?.status === 404) {
      error.value = 'Пациент не найден (404)'
    } else if (err?.response?.status === 401) {
      error.value = 'Неавторизован. Пожалуйста, войдите в систему.'
    } else {
      error.value = 'Не удалось загрузить данные пациента'
    }
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (props.patient) return

  const rawId = (route.params.userId ?? route.params.id) as string | number | undefined
  const userId = Number(rawId)

  if (!userId || Number.isNaN(userId)) return

  await loadPatient(userId)
})

watch(
  () => route.params.userId,
  async (newId) => {
    if (props.patient) return
    const userId = Number(newId)
    if (!userId || Number.isNaN(userId)) return
    await loadPatient(userId)
  }
)
</script>

<style scoped>
.patient-card {
  border: 1px solid #e6e6e6;
  padding: 14px;
  border-radius: 8px;
  background: #fff;
  max-width: 720px;
}

.loading {
  color: #666;
}

.error {
  color: #b00020;
}

.empty {
  color: #666;
}

.name {
  margin: 0 0 8px;
  font-size: 18px;
}

.meta {
  margin-top: 12px;
  color: #777;
  font-size: 12px;
}
</style>
```
