import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { DoctorScheduleService } from '../doctor-schedule/doctor-schedule.service'
import * as bcrypt from 'bcrypt'

@Injectable()
export class DatabaseInitService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly schedule: DoctorScheduleService,
  ) {}

  async onModuleInit(): Promise<void> {
    const usersCount = await this.prisma.user.count()

    if (usersCount > 0) {
      console.log('--- Тестовые данные уже существуют ---')
      return
    }

    console.log('--- Создаём тестовые данные... ---')

    const adminPassword = await bcrypt.hash('admin123', 10)

    // 1. Админ
    await this.prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@mail.com',
        passwordHash: adminPassword,
        role: 'ADMIN',
      },
    })

    // 2. Врачи (20)
    const doctorsList = [
      { first: 'Иван', last: 'Иванов', mid: 'Иванович', spec: 'Терапевт' },
      { first: 'Анна', last: 'Соколова', mid: 'Сергеевна', spec: 'Хирург' },

      { first: 'Сергей', last: 'Сидоров', mid: 'Сергеевич', spec: 'Кардиолог' },
      { first: 'Мария', last: 'Кузьмина', mid: 'Алексеевна', spec: 'Кардиолог' },

      { first: 'Алексей', last: 'Смирнов', mid: 'Алексеевич', spec: 'Невролог' },
      { first: 'Екатерина', last: 'Орлова', mid: 'Дмитриевна', spec: 'Невролог' },

      { first: 'Ольга', last: 'Федорова', mid: 'Ильинична', spec: 'Терапевт' },
      { first: 'Максим', last: 'Громов', mid: 'Антонович', spec: 'Офтальмолог' },

      { first: 'Ирина', last: 'Лебедева', mid: 'Павловна', spec: 'ЛОР' },
      { first: 'Павел', last: 'Захаров', mid: 'Павлович', spec: 'ЛОР' },

      { first: 'Артём', last: 'Волков', mid: 'Артёмович', spec: 'Эндокринолог' },
      { first: 'Татьяна', last: 'Морозова', mid: 'Ильинична', spec: 'Эндокринолог' },

      { first: 'Роман', last: 'Николаев', mid: 'Романович', spec: 'Гинеколог' },
      { first: 'Алина', last: 'Беляева', mid: 'Кирилловна', spec: 'Гинеколог' },

      { first: 'Кирилл', last: 'Денисов', mid: 'Владиславович', spec: 'Терапевт' },
      { first: 'Виктория', last: 'Киселёва', mid: 'Арсеньевна', spec: 'Педиатр' },

      { first: 'Матвей', last: 'Титов', mid: 'Матвеевич', spec: 'Дерматолог' },
      { first: 'София', last: 'Савельева', mid: 'Марковна', spec: 'Дерматолог' },

      { first: 'Тимофей', last: 'Рогов', mid: 'Тимофеевич', spec: 'Офтальмолог' },
      { first: 'Елена', last: 'Семенова', mid: 'Игоревна', spec: 'Офтальмолог' },
    ]

    await this.prisma.user.createMany({
      data: doctorsList.map((_, i) => ({
        username: `doctor${i + 1}`,
        email: `doctor${i + 1}@mail.com`,
        passwordHash: adminPassword,
        role: 'DOCTOR',
      })),
    })

    const doctorUsers = await this.prisma.user.findMany({
      where: { role: 'DOCTOR' },
      orderBy: { id: 'asc' },
    })

    // 3. Кабинеты
    const cabinetsData = Array.from({ length: 10 }).map((_, i) => ({
      number: String(101 + i),
      specialization: 'Комбинированный',
      workingHoursStart: i % 2 === 0 ? '08:00' : '09:00',
      workingHoursEnd: i % 2 === 0 ? '16:00' : '18:00',
      slotDuration: 15,
    }))

    await this.prisma.cabinet.createMany({ data: cabinetsData })

    const cabinets = await this.prisma.cabinet.findMany({
      orderBy: { id: 'asc' },
    })

    // 4. Профили врачей
    const doctorProfilesData = doctorsList.map((d, i) => ({
      userId: doctorUsers[i].id,
      firstName: d.first,
      lastName: d.last,
      middleName: d.mid,
      specialization: d.spec,
      isTherapist: d.spec === 'Терапевт',
      cabinetId: cabinets[Math.floor(i / 2)].id,
      photoUrl: `/uploads/doctors/doc${i + 1}.jpg`,
    }))

    await this.prisma.doctor.createMany({ data: doctorProfilesData })

    const doctorProfiles = await this.prisma.doctor.findMany({
      orderBy: { id: 'asc' },
    })

    // 5. Шаблоны расписания = рабочее время кабинета (Пн–Пт)
    for (const doc of doctorProfiles) {
      const cab = cabinets.find((c) => c.id === doc.cabinetId)!
      await this.prisma.doctorScheduleTemplate.createMany({
        data: [
          { doctorId: doc.id, dayOfWeek: 1, startTime: cab.workingHoursStart, endTime: cab.workingHoursEnd },
          { doctorId: doc.id, dayOfWeek: 2, startTime: cab.workingHoursStart, endTime: cab.workingHoursEnd },
          { doctorId: doc.id, dayOfWeek: 3, startTime: cab.workingHoursStart, endTime: cab.workingHoursEnd },
          { doctorId: doc.id, dayOfWeek: 4, startTime: cab.workingHoursStart, endTime: cab.workingHoursEnd },
          { doctorId: doc.id, dayOfWeek: 5, startTime: cab.workingHoursStart, endTime: cab.workingHoursEnd },
        ],
      })
    }

    // 6. Генерация смен на текущую неделю (Пн–Пт)
    for (const doc of doctorProfiles) {
      await this.schedule.generateShiftsForNextPeriod(doc.id)
    }

    // 7. Зоны терапевтов
    const therapistDoctors = doctorProfiles.filter((d) => d.isTherapist)

    const zonesData = therapistDoctors.flatMap((doc) => [
      { doctorId: doc.id, street: 'ленина', houses: ['10', '12', '5-20'] },
      { doctorId: doc.id, street: 'победы', houses: ['1', '3', '5'] },
      { doctorId: doc.id, street: 'гагарина', houses: ['50', '52'] },
    ])

    await this.prisma.therapistAddressZone.createMany({ data: zonesData })

    // 8. Пациенты
    const patientUsersData = Array.from({ length: 100 }).map((_, i) => ({
      username: `patient${i + 1}`,
      email: `patient${i + 1}@mail.com`,
      passwordHash: adminPassword,
      role: 'PATIENT',
    }))

    await this.prisma.user.createMany({ data: patientUsersData })

    const patientUsers = await this.prisma.user.findMany({
      where: { role: 'PATIENT' },
      orderBy: { id: 'asc' },
    })

    const firstNames = ['Иван', 'Пётр', 'Сергей', 'Алексей', 'Дмитрий', 'Андрей']
    const lastNames = ['Иванов', 'Петров', 'Сидоров', 'Смирнов', 'Кузнецов']
    const middleNames = ['Иванович', 'Петрович', 'Сергеевич', 'Алексеевич']

    const patientProfilesData = patientUsers.map((u, i) => ({
      userId: u.id,
      firstName: firstNames[i % firstNames.length],
      lastName: lastNames[i % lastNames.length],
      middleName: middleNames[i % middleNames.length],
      birthDate: new Date(`198${i % 10}-0${(i % 9) + 1}-15`),
      gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
      phone: `+37529${1000000 + i}`,
      region: 'Минская область',
      city: 'Минск',
      street: 'Ленина',
      houseNumber: `${(i % 50) + 1}`,
      apartment: `${(i % 100) + 1}`,
      medicalCardNumber: `MC-${100 + i}`,
      primaryTherapistId: therapistDoctors[i % therapistDoctors.length].id,
    }))

    await this.prisma.patient.createMany({ data: patientProfilesData })

    console.log('--- Тестовые данные созданы! ---')
  }
}
