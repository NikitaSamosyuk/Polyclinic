<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = defineProps<{
  open: boolean
  visit: any | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', payload: { dto: any; filesToDelete: number[]; newFiles: File[] }): void
}>()

const complaints = ref('')
const diagnosis = ref('')
const examination = ref('')
const treatment = ref('')
const recommendations = ref('')

const existingFiles = ref<any[]>([])
const filesToDelete = ref<Set<number>>(new Set())
const newFiles = ref<File[]>([])

watch(
  () => props.visit,
  (v) => {
    if (!v) return
    complaints.value = v.complaints || ''
    diagnosis.value = v.diagnosis || ''
    examination.value = v.examination || ''
    treatment.value = v.treatment || ''
    recommendations.value = v.recommendations || ''
    existingFiles.value = v.attachedFiles || []
    filesToDelete.value = new Set()
    newFiles.value = []
  },
  { immediate: true }
)

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files) return
  newFiles.value = [...newFiles.value, ...Array.from(target.files)]
  target.value = ''
}

function toggleDeleteFile(id: number) {
  const set = filesToDelete.value
  if (set.has(id)) set.delete(id)
  else set.add(id)
}

const existingFilesToShow = computed(() =>
  existingFiles.value.map((f) => ({
    ...f,
    markedForDelete: filesToDelete.value.has(f.id),
  }))
)

function removeNewFile(index: number) {
  newFiles.value.splice(index, 1)
}

function onSave() {
  emit('save', {
    dto: {
      complaints: complaints.value,
      diagnosis: diagnosis.value,
      examination: examination.value,
      treatment: treatment.value,
      recommendations: recommendations.value,
    },
    filesToDelete: Array.from(filesToDelete.value),
    newFiles: newFiles.value,
  })
}
</script>

<template>
  <div
    v-if="open && visit"
    class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
    @click.self="emit('close')"
  >
    <!-- ОБОЛОЧКА МОДАЛКИ -->
    <div class="bg-white w-full max-w-2xl rounded-xl shadow-xl flex flex-col max-h-[90vh]">
      <!-- СКРОЛЛЯЩАЯСЯ ЧАСТЬ -->
      <div class="p-8 overflow-y-auto flex-1 pb-32">
        <h2 class="text-2xl font-bold text-teal-800 mb-6">Редактировать визит</h2>

        <!-- Текстовые поля -->
        <div class="flex flex-col gap-4 text-[15px]">
          <textarea
            v-model="complaints"
            class="w-full px-3 py-2 border border-teal-500 rounded-lg resize-none"
            rows="2"
            placeholder="Жалобы"
          />
          <textarea
            v-model="diagnosis"
            class="w-full px-3 py-2 border border-teal-500 rounded-lg resize-none"
            rows="2"
            placeholder="Диагноз"
          />
          <textarea
            v-model="examination"
            class="w-full px-3 py-2 border border-teal-500 rounded-lg resize-none"
            rows="2"
            placeholder="Осмотр"
          />
          <textarea
            v-model="treatment"
            class="w-full px-3 py-2 border border-teal-500 rounded-lg resize-none"
            rows="2"
            placeholder="Лечение"
          />
          <textarea
            v-model="recommendations"
            class="w-full px-3 py-2 border border-teal-500 rounded-lg resize-none"
            rows="2"
            placeholder="Рекомендации"
          />
        </div>

        <!-- Файлы -->
        <div class="mt-6 space-y-3">
          <h3 class="text-lg font-semibold text-teal-800">Файлы визита</h3>

          <!-- Существующие -->
          <div v-if="existingFilesToShow.length" class="space-y-2">
            <p class="text-sm text-gray-600">Отметьте файлы, которые хотите удалить:</p>

            <ul class="flex flex-col gap-2">
              <li
                v-for="file in existingFilesToShow"
                :key="file.id"
                class="flex items-center justify-between border rounded-lg px-3 py-2"
                :class="
                  file.markedForDelete ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-200'
                "
              >
                <span class="text-sm text-gray-800 truncate max-w-[260px]">
                  {{ file.filePath.split('/').pop() }}
                </span>

                <button
                  type="button"
                  class="text-xs px-3 py-1 rounded-full border transition"
                  :class="
                    file.markedForDelete
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-red-600 border-red-400 hover:bg-red-50'
                  "
                  @click="toggleDeleteFile(file.id)"
                >
                  {{ file.markedForDelete ? 'Вернуть' : 'Удалить' }}
                </button>
              </li>
            </ul>
          </div>

          <!-- Новые -->
          <div class="space-y-2">
            <p class="text-sm text-gray-600">Добавить новые файлы:</p>

            <input
              type="file"
              multiple
              class="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
              @change="onFileChange"
            />

            <ul v-if="newFiles.length" class="mt-1 text-xs text-gray-600 space-y-1">
              <li
                v-for="(f, index) in newFiles"
                :key="f.name + f.size"
                class="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-1"
              >
                <span class="truncate max-w-[240px]">{{ f.name }}</span>

                <button class="text-red-600 text-xs hover:underline" @click="removeNewFile(index)">
                  Удалить
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- ФИКСИРОВАННЫЕ КНОПКИ -->
      <div class="p-4 border-t bg-white flex justify-end gap-3">
        <button
          class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          @click="emit('close')"
        >
          Отмена
        </button>

        <button
          class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
          @click="onSave"
        >
          Сохранить
        </button>
      </div>
    </div>
  </div>
</template>
