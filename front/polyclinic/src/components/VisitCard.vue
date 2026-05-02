<script setup lang="ts">
import { ref, computed } from 'vue'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const props = defineProps({
  visit: { type: Object, required: true },

  // роли
  isAdmin: { type: Boolean, required: true },
  isDoctor: { type: Boolean, required: true },
  isPatient: { type: Boolean, required: true },

  // 🔥 главное — флаги доступа, переданные из Visits.vue
  canEdit: { type: Boolean, required: true },
  canDelete: { type: Boolean, required: true },
})

const emit = defineEmits<{
  (e: 'delete-visit', visit: any): void
  (e: 'edit-visit', visit: any): void
}>()

const expanded = ref(false)

function toggle() {
  expanded.value = !expanded.value
}

function getDate(d: string) {
  return d ? d.slice(0, 10) : ''
}

function getTime(d: string) {
  return d ? d.slice(11, 16) : ''
}

const formattedDate = computed(() => {
  const raw = getDate(props.visit.visitDatetime)
  if (!raw) return '—'
  const [y, m, d] = raw.split('-')
  return `${d}.${m}.${y}`
})

async function downloadFile(file: any) {
  try {
    const url = `${API_URL}${file.filePath}`
    const res = await fetch(url)
    if (!res.ok) return alert('Файл не найден')

    const blob = await res.blob()
    const objectUrl = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = objectUrl
    a.download = file.filePath.split('/').pop() || 'file'
    a.click()

    URL.revokeObjectURL(objectUrl)
  } catch {
    alert('Ошибка скачивания файла')
  }
}
</script>

<template>
  <div
    class="relative w-full bg-white border border-teal-300 rounded-xl shadow-md hover:shadow-lg transition overflow-hidden"
  >
    <!-- ❌ КРЕСТИК (только если canDelete) -->
    <button
      v-if="canDelete"
      @click.stop="emit('delete-visit', visit)"
      class="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition"
      title="Удалить визит"
    >
      <img src="@/assets/cancel.png" class="w-5 h-5 opacity-80 hover:opacity-100" />
    </button>

    <!-- ВЕРХНИЙ БЛОК -->
    <div class="p-6 cursor-pointer select-none space-y-4" @click="toggle">
      <div class="pb-3 border-b border-gray-200">
        <h2 class="text-2xl font-bold text-teal-800">{{ formattedDate }}</h2>
        <p class="text-gray-600 text-sm">{{ getTime(visit.visitDatetime) }}</p>
      </div>

      <div class="flex items-start gap-3">
        <img src="@/assets/doctor-icon.png" class="w-7 h-7" />
        <div>
          <p class="font-semibold text-lg text-gray-900 leading-tight">
            {{ visit.doctor.lastName }} {{ visit.doctor.firstName }}
            <span v-if="visit.doctor.middleName">{{ visit.doctor.middleName }}</span>
          </p>
          <p class="text-sm text-gray-600">{{ visit.doctor.specialization }}</p>
        </div>
      </div>

      <div class="flex items-start gap-3">
        <img src="@/assets/patient-icon.png" class="w-7 h-7" />
        <p class="font-semibold text-lg text-gray-900 leading-tight">
          {{ visit.patient.lastName }} {{ visit.patient.firstName }}
          <span v-if="visit.patient.middleName">{{ visit.patient.middleName }}</span>
        </p>
      </div>

      <div
        class="bg-teal-50 border border-teal-200 rounded-lg p-4 shadow-sm flex items-start gap-3"
      >
        <img src="@/assets/document-icon.png" class="w-7 h-7" />
        <p class="text-sm text-gray-700 leading-snug">
          <b>Диагноз:</b> {{ visit.diagnosis || '—' }}
        </p>
      </div>
    </div>

    <!-- НИЖНИЙ БЛОК -->
    <transition name="expand">
      <div v-if="expanded" class="overflow-hidden bg-teal-50 border-t border-teal-200">
        <div class="px-6 pt-4 pb-6 space-y-4">
          <h3 class="text-xl font-bold text-teal-800">Подробности визита</h3>

          <p class="text-gray-700 text-sm"><b>Жалобы:</b> {{ visit.complaints || '—' }}</p>
          <p class="text-gray-700 text-sm"><b>Осмотр:</b> {{ visit.examination || '—' }}</p>
          <p class="text-gray-700 text-sm"><b>Лечение:</b> {{ visit.treatment || '—' }}</p>
          <p class="text-gray-700 text-sm">
            <b>Рекомендации:</b> {{ visit.recommendations || '—' }}
          </p>

          <div v-if="visit.attachedFiles?.length">
            <h4 class="font-semibold text-teal-700 mb-2">Файлы визита:</h4>

            <ul class="flex flex-col gap-2">
              <li
                v-for="file in visit.attachedFiles"
                :key="file.id"
                class="flex justify-between items-center bg-white border border-teal-200 rounded-lg p-2"
              >
                <button
                  @click.stop="downloadFile(file)"
                  class="text-teal-700 underline text-sm truncate max-w-[240px] text-left"
                >
                  {{ file.filePath.split('/').pop() }}
                </button>

                <img src="@/assets/file-icon.png" class="w-6 h-6 opacity-70" />
              </li>
            </ul>
          </div>

          <!-- 🔥 Кнопка "Изменить визит" (только если canEdit) -->
          <div v-if="canEdit" class="pt-4 border-t border-gray-200 flex gap-3 justify-end">
            <button
              class="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 shadow"
              @click.stop="emit('edit-visit', visit)"
            >
              Изменить визит
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 600px;
  opacity: 1;
}

.expand-enter-active,
.expand-leave-active {
  transition:
    max-height 0.25s ease,
    opacity 0.25s ease;
}
</style>
