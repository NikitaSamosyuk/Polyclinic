<template>
  <div class="space-y-4">
    <!-- Заголовок -->
    <div class="flex items-center justify-between">
      <h3 class="font-bold text-xl text-teal-800">Выбор даты</h3>

      <div class="flex gap-2">
        <button
          type="button"
          class="px-3 py-1.5 text-sm border border-teal-300 rounded-lg bg-white hover:bg-teal-50 transition disabled:opacity-40"
          :disabled="currentWeekIndex === 0"
          @click="prevWeek"
        >
          ‹ Пред.
        </button>

        <button
          type="button"
          class="px-3 py-1.5 text-sm border border-teal-300 rounded-lg bg-white hover:bg-teal-50 transition"
          @click="nextWeek"
        >
          След. ›
        </button>
      </div>
    </div>

    <!-- Заголовки дней недели -->
    <div class="grid grid-cols-7 gap-2 text-xs text-center text-gray-500 font-medium">
      <div v-for="d in weekDays" :key="d">{{ d }}</div>
    </div>

    <!-- Дни -->
    <div class="grid grid-cols-7 gap-2">
      <button
        v-for="day in visibleDays"
        :key="day.iso"
        type="button"
        class="p-3 rounded-xl border text-sm flex flex-col items-center gap-1 shadow-sm transition"
        :class="{
          'bg-teal-600 text-white border-teal-600 shadow-md': day.iso === modelValue,
          'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed':
            day.isWeekend || day.isDisabled,
          'bg-white hover:bg-teal-50 border-teal-300 text-gray-800':
            !day.isWeekend && !day.isDisabled && day.iso !== modelValue,
        }"
        :disabled="day.isWeekend || day.isDisabled"
        @click="select(day.iso)"
      >
        <span class="font-semibold">{{ day.label }}</span>

        <span v-if="day.isWeekend" class="text-[10px] uppercase tracking-wide text-red-500">
          выходной
        </span>

        <span v-else-if="day.hasSlots" class="text-[10px] text-green-600 font-medium">
          есть слоты
        </span>

        <span v-else class="text-[10px] text-red-500">нет слотов</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

interface DayInfo {
  iso: string
  label: string
  isWeekend: boolean
  hasSlots: boolean
  isDisabled: boolean
}

const props = defineProps<{
  modelValue: string | null
  days: {
    iso: string
    isWeekend: boolean
    hasSlots: boolean
  }[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()

const currentWeekIndex = ref(0)

const sortedDays = computed(() => [...props.days].sort((a, b) => (a.iso < b.iso ? -1 : 1)))

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function getWeekDay(iso: string) {
  const d = new Date(iso)
  let wd = d.getDay()
  if (wd === 0) wd = 7
  return wd
}

const normalizedDays = computed(() => {
  const days = sortedDays.value
  const firstMondayIndex = days.findIndex((d) => getWeekDay(d.iso) === 1)
  return firstMondayIndex > 0 ? days.slice(firstMondayIndex) : days
})

const weeks = computed(() => {
  const result: (typeof props.days)[][] = []
  let currentWeek: typeof props.days = []

  for (const day of normalizedDays.value) {
    const wd = getWeekDay(day.iso)
    if (wd === 1 && currentWeek.length > 0) {
      result.push(currentWeek)
      currentWeek = []
    }
    currentWeek.push(day)
  }

  if (currentWeek.length > 0) result.push(currentWeek)
  return result
})

const visibleDays = computed<DayInfo[]>(() => {
  const w = weeks.value[currentWeekIndex.value] ?? []

  return w.map((d) => ({
    iso: d.iso,
    label: d.iso.slice(8, 10) + '.' + d.iso.slice(5, 7),
    isWeekend: d.isWeekend,
    hasSlots: d.hasSlots,
    isDisabled: !d.hasSlots,
  }))
})

function select(iso: string) {
  emit('update:modelValue', iso)
}

function prevWeek() {
  if (currentWeekIndex.value > 0) currentWeekIndex.value--
}

function nextWeek() {
  if (currentWeekIndex.value < weeks.value.length - 1) currentWeekIndex.value++
}

onMounted(() => {
  if (!props.modelValue && sortedDays.value.length > 0) {
    const firstWithSlots = sortedDays.value.find((d) => d.hasSlots && !d.isWeekend)
    emit('update:modelValue', firstWithSlots?.iso ?? sortedDays.value[0].iso)
  }
})

watch(
  () => props.days,
  () => {
    currentWeekIndex.value = 0
  }
)
</script>

<style scoped>
button {
  transition: 0.15s ease;
}
</style>
