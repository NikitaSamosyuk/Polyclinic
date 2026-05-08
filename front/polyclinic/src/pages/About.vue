<template>
  <div class="w-full space-y-16 px-6 py-10 text-gray-800">
    <!-- Заголовок -->
    <section class="text-center space-y-4">
      <h1 class="text-4xl font-bold text-teal-800">О учреждении</h1>
      <p class="max-w-3xl mx-auto text-lg leading-relaxed">
        Государственное учреждение «Городская клиническая поликлиника №165» — многопрофильное
        медицинское учреждение, оказывающее амбулаторно‑клиническую помощь жителям Секретного района
        г. Минска.
      </p>
    </section>

    <!-- История -->
    <section class="max-w-4xl mx-auto space-y-4">
      <h2 class="text-2xl font-bold text-teal-700">История</h2>
      <p class="leading-relaxed">
        Поликлиника была основана в 1978 году и за десятилетия превратилась из небольшого
        амбулаторного центра в современное медицинское учреждение, предоставляющее широкий спектр
        диагностических и лечебных услуг.
      </p>
      <p class="leading-relaxed">
        Сегодня в структуру поликлиники входят терапевтические отделения, гинекология, стоматология,
        кабинет УЗИ‑диагностики, лаборатория, кабинет профилактики и другие подразделения.
        Учреждение активно участвует в городских программах вакцинации, диспансеризации и раннего
        выявления заболеваний.
      </p>
    </section>

    <!-- Преимущества -->
    <section class="max-w-4xl mx-auto space-y-4">
      <h2 class="text-2xl font-bold text-teal-700">Наши преимущества</h2>
      <ul class="list-disc list-inside space-y-2 text-gray-700">
        <li>Высококвалифицированные специалисты с многолетним опытом</li>
        <li>Современное диагностическое оборудование</li>
        <li>Электронная система записи и ведения медицинской документации</li>
        <li>Удобное расположение и доступность для жителей района</li>
        <li>Комплексный подход к лечению и профилактике заболеваний</li>
      </ul>
    </section>

    <!-- Администрация -->
    <section class="max-w-5xl mx-auto space-y-6">
      <h2 class="text-2xl font-bold text-teal-700 text-center">Администрация</h2>

      <!-- Горизонтальная линия фотографий -->
      <div class="flex flex-wrap justify-center gap-10">
        <div class="flex flex-col items-center space-y-3">
          <img
            src="/src/assets/chief.jpg"
            class="w-40 h-40 object-cover rounded-full shadow-lg border border-gray-300"
          />
          <div class="text-center text-sm">
            <strong>Кацман Семен Маркович</strong><br />
            Главный врач
          </div>
        </div>

        <div class="flex flex-col items-center space-y-3">
          <img
            src="/src/assets/suchief.jpg"
            class="w-40 h-40 object-cover rounded-full shadow-lg border border-gray-300"
          />
          <div class="text-center text-sm">
            <strong>Дмитрий Юрьевич Пучков</strong><br />
            Заместитель по медицинской части
          </div>
        </div>

        <div class="flex flex-col items-center space-y-3">
          <img
            src="/src/assets/med_dep.jpg"
            class="w-40 h-40 object-cover rounded-full shadow-lg border border-gray-300"
          />
          <div class="text-center text-sm">
            <strong>Дмитрий Алексеевич Попов</strong><br />
            Заместитель по организационной работе
          </div>
        </div>

        <div class="flex flex-col items-center space-y-3">
          <img
            src="/src/assets/nurse.jpg"
            class="w-40 h-40 object-cover rounded-full shadow-lg border border-gray-300"
          />
          <div class="text-center text-sm">
            <strong>Марина Владимировна Кузнецова</strong><br />
            Старшая медсестра
          </div>
        </div>
      </div>
    </section>

    <!-- Интересные факты -->
    <section class="max-w-4xl mx-auto space-y-4">
      <h2 class="text-2xl font-bold text-teal-700">Интересные факты</h2>
      <ul class="list-disc list-inside space-y-2 text-gray-700">
        <li>Поликлиника обслуживает более 120 000 посещений ежегодно</li>
        <li>Одной из первых внедрила электронные медицинские карты</li>
        <li>Регулярно проводит дни здоровья, вакцинации и профилактические акции</li>
        <li>Работает специализированный кабинет профилактики сердечно‑сосудистых заболеваний</li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts"></script>
