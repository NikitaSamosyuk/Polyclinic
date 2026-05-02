<template>
  <div class="w-full space-y-16">
    <!-- Центральная фотография -->
    <div class="flex justify-center">
      <img
        src="/src/assets/polyclinic.jpg"
        alt="Поликлиника"
        class="w-[85%] rounded-xl shadow-lg border border-gray-300"
      />
    </div>

    <!-- Контактная информация -->
    <section class="w-full flex justify-center">
      <div class="w-full max-w-[1200px] px-10">
        <h2 class="text-2xl font-bold text-teal-800 text-center mb-8">Контактная информация</h2>

        <div class="grid grid-cols-3 gap-10 text-[16px] text-gray-800">
          <!-- Справочная и регистратура -->
          <div class="space-y-3">
            <h3 class="text-lg font-bold text-teal-700">Справочная</h3>
            <p class="font-medium">+375 17 23 79 898</p>

            <h3 class="text-lg font-bold text-teal-700">Регистратура</h3>
            <p class="font-medium">+375 29 60 00 150</p>
          </div>

          <!-- Вызов врача на дом -->
          <div class="space-y-3">
            <h3 class="text-lg font-bold text-teal-700">Вызов врача на дом</h3>
            <p><span class="font-semibold">Будние дни:</span></p>
            <p>08:00–13:00 — <span class="font-medium">+375 17 23 79 900</span></p>
            <p>13:00–18:00 — <span class="font-medium">+375 17 23 79 905</span></p>
            <p>
              <span class="font-semibold">Выходные и праздники:</span><br />
              <span class="font-medium whitespace-nowrap">+375 17 23 79 901</span>
            </p>
          </div>

          <!-- Горячая линия и стоматология -->
          <div class="space-y-3">
            <h3 class="text-lg font-bold text-teal-700">Горячая линия</h3>
            <p class="font-medium">+375 17 23 79 902</p>

            <h3 class="text-lg font-bold text-teal-700">Линия доверия</h3>
            <p class="font-medium">+375 17 23 79 903</p>

            <h3 class="text-lg font-bold text-teal-700">Стоматологическая регистратура</h3>
            <p class="font-medium">+375 17 23 79 904</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Герб и миссия -->
    <section class="text-center px-4 space-y-8">
      <RouterLink to="/emblem">
        <img
          src="/src/assets/emblem.png"
          alt="Герб"
          class="mx-auto w-[90%] max-w-[900px] h-[32rem] object-contain drop-shadow-lg"
        />
      </RouterLink>

      <p class="text-lg text-gray-700 font-medium max-w-3xl mx-auto leading-relaxed">
        Мы стремимся обеспечить каждому пациенту доступную, качественную и своевременную медицинскую
        помощь.
      </p>
    </section>

    <!-- Отделения -->
    <section class="px-6 space-y-8">
      <h2 class="text-2xl font-bold text-teal-800 text-center">Наши отделения</h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        <div
          class="bg-teal-50 rounded-xl shadow p-4 flex flex-col items-center border border-teal-100"
        >
          <img src="/src/assets/stomatology.jpg" class="w-full h-40 object-cover rounded mb-3" />
          <span class="font-semibold text-gray-800 text-lg">Стоматология</span>
        </div>

        <div
          class="bg-teal-50 rounded-xl shadow p-4 flex flex-col items-center border border-teal-100"
        >
          <img src="/src/assets/gynecology.jpg" class="w-full h-40 object-cover rounded mb-3" />
          <span class="font-semibold text-gray-800 text-lg">Гинекология</span>
        </div>

        <div
          class="bg-teal-50 rounded-xl shadow p-4 flex flex-col items-center border border-teal-100"
        >
          <img src="/src/assets/ultrasound.jpg" class="w-full h-40 object-cover rounded mb-3" />
          <span class="font-semibold text-gray-800 text-lg">УЗИ‑диагностика</span>
        </div>

        <div
          class="bg-teal-50 rounded-xl shadow p-4 flex flex-col items-center border border-teal-100"
        >
          <img src="/src/assets/therapy.jpg" class="w-full h-40 object-cover rounded mb-3" />
          <span class="font-semibold text-gray-800 text-lg">Терапевтическое отделение</span>
        </div>

        <div
          class="bg-teal-50 rounded-xl shadow p-4 flex flex-col items-center border border-teal-100"
        >
          <img src="/src/assets/laboratory.jpg" class="w-full h-40 object-cover rounded mb-3" />
          <span class="font-semibold text-gray-800 text-lg">Лаборатория</span>
        </div>
      </div>
    </section>

    <!-- Полезная информация -->
    <section class="px-6 space-y-8">
      <h2 class="text-2xl font-bold text-teal-800 text-center">Полезная информация</h2>

      <!-- COVID -->
      <div class="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-sm">
        <h3 class="text-lg font-semibold text-red-800 mb-2">COVID‑19: меры предосторожности</h3>
        <p class="text-gray-700 leading-relaxed">
          При посещении учреждения рекомендуется использовать маску и соблюдать дистанцию. Вход с
          симптомами ОРВИ осуществляется только через фильтр‑бокс. Вакцинация проводится по
          предварительной записи.
        </p>
      </div>

      <!-- Иностранные граждане -->
      <div class="bg-cyan-50 border-l-4 border-cyan-400 p-6 rounded-lg shadow-sm">
        <h3 class="text-lg font-semibold text-cyan-800 mb-2">
          Медицинская помощь иностранным гражданам
        </h3>
        <p class="text-gray-700 leading-relaxed">
          Иностранные граждане могут получать медицинскую помощь на платной основе или в рамках
          международных соглашений. Необходимо предъявить паспорт и (при наличии) страховой полис.
        </p>
      </div>

      <!-- Новости -->
      <div class="bg-teal-50 border-l-4 border-teal-400 p-6 rounded-lg shadow-sm">
        <h3 class="text-lg font-semibold text-teal-800 mb-2">Новости и объявления</h3>
        <ul class="list-disc list-inside text-gray-700 space-y-2 leading-relaxed">
          <li>С 1 декабря открыта запись на вакцинацию против гриппа.</li>
          <li>Начал работу кабинет профилактики сердечно‑сосудистых заболеваний.</li>
          <li>В праздничные дни действует специальный график работы.</li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts"></script>
