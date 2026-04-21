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
    } else {
      error.value = 'Не удалось загрузить данные пациента'
    }
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (props.patient) return

  const rawId = route.params.userId ?? route.params.id
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
