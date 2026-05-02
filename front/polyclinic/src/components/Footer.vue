<template>
  <footer class="bg-white border-t border-teal-200 mt-12">
    <!-- Верхняя часть футера -->
    <div class="px-6 py-10 grid grid-cols-2 gap-8 items-start">
      <!-- Левая колонка -->
      <div class="space-y-4">
        <!-- Министерство -->
        <a
          href="https://minzdrav.gov.by/"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm text-cyan-700 hover:text-cyan-800 cursor-pointer"
        >
          Министерство здравоохранения Республики Беларусь
        </a>

        <h2 class="text-2xl md:text-3xl font-extrabold text-teal-800 leading-snug">
          Городская клиническая поликлиника №165
        </h2>

        <!-- Контакты -->
        <div class="space-y-2 text-sm text-gray-700">
          <p>
            <span class="font-semibold text-teal-700">Email: </span>
            <span class="text-gray-700">info@polyclinic165.by</span>
          </p>

          <!-- МТС -->
          <div class="flex items-center gap-2">
            <a href="https://mts.by" target="_blank" rel="noopener noreferrer">
              <div class="w-6 h-6 bg-red-600 flex items-center justify-center rounded">
                <img :src="mts" alt="MTS" class="w-6 h-6 object-contain" />
              </div>
            </a>
            <span>+375 17 23 79 898</span>
          </div>

          <!-- A1 -->
          <div class="flex items-center gap-2">
            <a href="https://a1.by" target="_blank" rel="noopener noreferrer">
              <img :src="a1" alt="A1" class="w-5 h-5 object-contain" />
            </a>
            <span>+375 29 60 00 150</span>
          </div>

          <p class="text-teal-700">Справочная служба работает круглосуточно</p>
        </div>
      </div>

      <!-- Правая колонка -->
      <div class="flex flex-col items-end space-y-4">
        <p class="text-sm text-gray-700">Минск, ул. Несуществующая, 21</p>
        <img
          src="/src/assets/polyclinic.jpg"
          alt="Поликлиника"
          class="w-96 h-56 object-cover rounded-md shadow"
        />
      </div>
    </div>

    <!-- Разделительная линия -->
    <div class="border-t border-teal-300 my-6"></div>

    <!-- Лента партнёров -->
    <div
      class="overflow-hidden relative px-6 py-4 cursor-grab active:cursor-grabbing"
      @mousedown="startDrag"
      @mousemove="onDrag"
      @mouseup="endDrag"
      @mouseleave="endDrag"
    >
      <div
        class="flex gap-3 transition-transform duration-700 ease-linear"
        :style="{ transform: `translateX(-${currentOffset}px)` }"
      >
        <div v-for="(partner, i) in partners" :key="i" class="w-40 h-16 flex-shrink-0">
          <RouterLink to="/fake">
            <img
              :src="partner"
              alt="Партнёр"
              class="w-full h-full object-contain select-none"
              @dragstart.prevent
            />
          </RouterLink>
        </div>

        <!-- Дублирование для бесконечной карусели -->
        <div v-for="(partner, i) in partners" :key="'dup-' + i" class="w-40 h-16 flex-shrink-0">
          <RouterLink to="/fake">
            <img
              :src="partner"
              alt="Партнёр"
              class="w-full h-full object-contain select-none"
              @dragstart.prevent
            />
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Средняя часть: политики слева, соцсети справа -->
    <div class="px-6 py-6 flex justify-between items-center">
      <!-- Политики -->
      <div class="flex flex-col space-y-2 text-sm">
        <RouterLink to="/fake" class="text-cyan-700 hover:text-cyan-800">
          Политика обработки персональных данных
        </RouterLink>
        <RouterLink to="/fake" class="text-cyan-700 hover:text-cyan-800">
          Политика использования cookie‑файлов
        </RouterLink>
      </div>

      <!-- Соцсети -->
      <div class="flex flex-col items-end space-y-3">
        <span class="text-lg font-bold text-gray-800 uppercase">Присоединяйтесь к нам</span>
        <div class="flex gap-3">
          <a href="https://web.telegram.org/k/" target="_blank" rel="noopener noreferrer">
            <img :src="telegram" alt="Telegram" class="w-8 h-8 object-contain select-none" />
          </a>
          <a href="https://www.instagram.com/?hl=ru" target="_blank" rel="noopener noreferrer">
            <img :src="instagram" alt="Instagram" class="w-8 h-8 object-contain select-none" />
          </a>
          <a href="https://vk.com/feed" target="_blank" rel="noopener noreferrer">
            <img :src="vk" alt="VK" class="w-8 h-8 object-contain select-none" />
          </a>
          <a href="https://x.com/" target="_blank" rel="noopener noreferrer">
            <img :src="twitter" alt="Twitter" class="w-8 h-8 object-contain select-none" />
          </a>
          <a href="https://ok.ru/" target="_blank" rel="noopener noreferrer">
            <img :src="ok" alt="OK" class="w-8 h-8 object-contain select-none" />
          </a>
        </div>
      </div>
    </div>

    <!-- Нижняя полоса -->
    <div class="bg-teal-200 text-center py-3 text-sm text-gray-800">
      © 2026 ГКП №165. Все права защищены.
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

// соцсети
import twitter from '/src/assets/twitter.png'
import telegram from '/src/assets/telegram.png'
import vk from '/src/assets/vk.png'
import ok from '/src/assets/ok.png'
import instagram from '/src/assets/Instagram.png'

// операторы
import mts from '/src/assets/mts.svg'
import a1 from '/src/assets/a1.svg'

// партнёры
const modules = import.meta.glob('/src/assets/partners/*.{png,jpg,jpeg,svg}', { eager: true })
const partners = Object.values(modules).map((m: any) => m.default)

const currentOffset = ref(0)
const itemWidth = 160 + 12
let interval: number | undefined

let isDragging = false
let startX = 0
let scrollStart = 0

const startDrag = (e: MouseEvent) => {
  isDragging = true
  startX = e.clientX
  scrollStart = currentOffset.value
}

const onDrag = (e: MouseEvent) => {
  if (!isDragging) return
  const dx = e.clientX - startX
  currentOffset.value = scrollStart - dx
}

const endDrag = () => {
  isDragging = false
}

onMounted(() => {
  interval = window.setInterval(() => {
    currentOffset.value += itemWidth
    if (currentOffset.value >= partners.length * itemWidth) {
      currentOffset.value = 0
    }
  }, 3000)
})

onBeforeUnmount(() => {
  clearInterval(interval)
})
</script>
