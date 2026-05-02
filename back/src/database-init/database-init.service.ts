import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DoctorScheduleService } from '../doctor-schedule/doctor-schedule.service';
import { ScheduleService } from '../schedule/schedule.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class DatabaseInitService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly doctorSchedule: DoctorScheduleService,
    private readonly schedule: ScheduleService,
  ) {}

  async onModuleInit(): Promise<void> {
    const usersCount = await this.prisma.user.count();

    if (usersCount > 0) {
      console.log('--- Тестовые данные уже существуют ---');
      return;
    }

    console.log('--- Создаём тестовые данные... ---');

    const adminPassword = await bcrypt.hash('admin123', 10);

    // 1. Админ
    await this.prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@mail.com',
        passwordHash: adminPassword,
        role: Role.ADMIN,
      },
    });

    // 2. Врачи
    const doctorsList = [
      {
        first: 'Владислав',
        last: 'Лобачев',
        mid: 'Игоревич',
        spec: 'Терапевт',
      },
      { first: 'Анна', last: 'Соколова', mid: 'Сергеевна', spec: 'Хирург' },
      {
        first: 'Александр',
        last: 'Абрамушкин',
        mid: 'Александрович',
        spec: 'Проктолог',
      },
      {
        first: 'Мария',
        last: 'Кузьмина',
        mid: 'Алексеевна',
        spec: 'Кардиолог',
      },
      {
        first: 'Алексей',
        last: 'Смирнов',
        mid: 'Алексеевич',
        spec: 'Невролог',
      },
      {
        first: 'Екатерина',
        last: 'Орлова',
        mid: 'Дмитриевна',
        spec: 'Невролог',
      },
      { first: 'Ольга', last: 'Федорова', mid: 'Ильинична', spec: 'Терапевт' },
      {
        first: 'Максим',
        last: 'Громов',
        mid: 'Антонович',
        spec: 'Офтальмолог',
      },
      {
        first: 'Ирина',
        last: 'Лебедева',
        mid: 'Павловна',
        spec: 'Отоларинголог',
      },
      {
        first: 'Павел',
        last: 'Захаров',
        mid: 'Павлович',
        spec: 'Отоларинголог',
      },
      {
        first: 'Кузьма',
        last: 'Распутин',
        mid: 'Иванович',
        spec: 'Дерматовенеролог',
      },
      {
        first: 'Татьяна',
        last: 'Морозова',
        mid: 'Ильинична',
        spec: 'Эндокринолог',
      },
      {
        first: 'Владислав',
        last: 'Лапенко',
        mid: 'Владиславович',
        spec: 'Уролог',
      },
      { first: 'Алина', last: 'Беляева', mid: 'Кирилловна', spec: 'Гинеколог' },
      {
        first: 'Кирилл',
        last: 'Денисов',
        mid: 'Владиславович',
        spec: 'Терапевт',
      },
      {
        first: 'Виктория',
        last: 'Киселёва',
        mid: 'Арсеньевна',
        spec: 'Стоматолог',
      },
      {
        first: 'Владимир',
        last: 'Муромец',
        mid: 'Святогорович',
        spec: 'Дерматолог',
      },
      {
        first: 'София',
        last: 'Савельева',
        mid: 'Марковна',
        spec: 'Дерматолог',
      },
      {
        first: 'Тимофей',
        last: 'Рогов',
        mid: 'Тимофеевич',
        spec: 'Офтальмолог',
      },
      {
        first: 'Елена',
        last: 'Семенова',
        mid: 'Игоревна',
        spec: 'Офтальмолог',
      },
    ];

    await this.prisma.user.createMany({
      data: doctorsList.map((_, i) => ({
        username: `doctor${i + 1}`,
        email: `doctor${i + 1}@mail.com`,
        passwordHash: adminPassword,
        role: Role.DOCTOR,
      })),
    });

    const doctorUsers = await this.prisma.user.findMany({
      where: { role: Role.DOCTOR },
      orderBy: { id: 'asc' },
    });

    // 3. Кабинеты
    const cabinetsData = Array.from({ length: 10 }).map((_, i) => ({
      number: String(101 + i),
      specialization: 'Комбинированный',
      workingHoursStart: i % 2 === 0 ? '08:00' : '09:00',
      workingHoursEnd: i % 2 === 0 ? '16:00' : '18:00',
      slotDuration: 15,
    }));

    await this.prisma.cabinet.createMany({ data: cabinetsData });

    const cabinets = await this.prisma.cabinet.findMany({
      orderBy: { id: 'asc' },
    });

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
    }));

    await this.prisma.doctor.createMany({ data: doctorProfilesData });

    const doctorProfiles = await this.prisma.doctor.findMany({
      orderBy: { id: 'asc' },
    });

    // 5. Шаблоны расписания
    for (const doc of doctorProfiles) {
      const cab = cabinets.find((c) => c.id === doc.cabinetId)!;
      await this.prisma.doctorScheduleTemplate.createMany({
        data: [1, 2, 3, 4, 5].map((day) => ({
          doctorId: doc.id,
          dayOfWeek: day,
          startTime: cab.workingHoursStart,
          endTime: cab.workingHoursEnd,
        })),
      });
    }

    // 6. Генерация смен
    for (const doc of doctorProfiles) {
      await this.doctorSchedule.generateShiftsForNextPeriod(doc.id);
    }

    // 7. Пациенты
    const patientUsersData = Array.from({ length: 100 }).map((_, i) => ({
      username: `patient${i + 1}`,
      email: `patient${i + 1}@mail.com`,
      passwordHash: adminPassword,
      role: Role.PATIENT,
    }));

    await this.prisma.user.createMany({ data: patientUsersData });

    const patientUsers = await this.prisma.user.findMany({
      where: { role: Role.PATIENT },
      orderBy: { id: 'asc' },
    });

    const firstNames = [
      'Иван',
      'Пётр',
      'Сергей',
      'Алексей',
      'Дмитрий',
      'Андрей',
    ];
    const lastNames = ['Иванов', 'Петров', 'Сидоров', 'Смирнов', 'Кузнецов'];
    const middleNames = ['Иванович', 'Петрович', 'Сергеевич', 'Алексеевич'];

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
      primaryTherapistId: doctorProfiles[i % doctorProfiles.length].id,
    }));

    await this.prisma.patient.createMany({ data: patientProfilesData });

    // 8. Создаём записи
    console.log('--- Создаём записи пациентов ---');

    const allDoctors = doctorProfiles;
    const allPatients = await this.prisma.patient.findMany({
      orderBy: { id: 'asc' },
    });

    function randomItem<T>(arr: T[]): T {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    function randomDateWithin(days: number): string {
      const d = new Date();
      d.setDate(d.getDate() + Math.floor(Math.random() * days));
      return d.toISOString().split('T')[0];
    }

    let createdAppointments = 0;

    for (const patient of allPatients) {
      const doctor = randomItem(allDoctors);
      const date = randomDateWithin(10);

      const shift = await this.schedule.getDoctorShift(doctor.id, date);
      if (!shift) continue;

      const slots = await this.schedule.getSlotsForDoctor(doctor.id, date);
      const freeSlot = slots.slots.find((s) => s.isFree);
      if (!freeSlot) continue;

      await this.prisma.appointment.create({
        data: {
          patientId: patient.id,
          doctorId: doctor.id,
          cabinetId: shift.cabinetId,
          appointmentDate: new Date(date),
          startTime: freeSlot.start,
          endTime: freeSlot.end,
        },
      });

      createdAppointments++;
    }

    console.log(`--- Создано ${createdAppointments} записей ---`);

    // 9. Создаём визиты
    console.log('--- Создаём визиты ---');

    const appointments = await this.prisma.appointment.findMany({
      orderBy: { id: 'asc' },
    });

    let visitsCreated = 0;

    // 🔥 ЭТАЛОННЫЕ ПАПКИ (ты кладёшь туда реальные файлы)
    const sourceDirs = [
      path.join(process.cwd(), 'uploads', 'visits', '1'),
      path.join(process.cwd(), 'uploads', 'visits', '2'),
      path.join(process.cwd(), 'uploads', 'visits', '3'),
    ];

    for (const appt of appointments) {
      const exists = await this.prisma.visit.findUnique({
        where: { appointmentId: appt.id },
      });
      if (exists) continue;

      const visit = await this.prisma.visit.create({
        data: {
          appointmentId: appt.id,
          patientId: appt.patientId,
          doctorId: appt.doctorId,
          visitDatetime: new Date(appt.startTime.getTime() + 30 * 60 * 1000),
          complaints: 'Жалобы на слабость и недомогание',
          diagnosis: 'ОРВИ',
          examination: 'Осмотр, измерение температуры, аускультация',
          treatment: 'Постельный режим, питьё, жаропонижающие',
          recommendations: 'Повторный визит при ухудшении',
        },
      });

      // создаём папку визита
      const visitDir = path.join(
        process.cwd(),
        'uploads',
        'visits',
        String(visit.id),
      );
      if (!fs.existsSync(visitDir)) {
        fs.mkdirSync(visitDir, { recursive: true });
      }

      // выбираем случайную эталонную папку
      const src = randomItem(sourceDirs);

      // читаем файлы из эталонной папки
      const files = fs.readdirSync(src);

      // выбираем случайные 1–5 файлов
      const selected = [...files]
        .sort(() => Math.random() - 0.5)
        .slice(0, 1 + Math.floor(Math.random() * 5));

      for (const f of selected) {
        const srcPath = path.join(src, f);
        const dstPath = path.join(visitDir, f);

        // копируем файл
        fs.copyFileSync(srcPath, dstPath);

        // создаём запись в БД
        await this.prisma.attachedFile.create({
          data: {
            visitId: visit.id,
            fileType: f.endsWith('.pdf')
              ? 'application/pdf'
              : f.endsWith('.doc') || f.endsWith('.docx')
                ? 'application/msword'
                : 'image/jpeg',
            filePath: `/uploads/visits/${visit.id}/${f}`,
          },
        });
      }

      visitsCreated++;
    }

    console.log(`--- Создано ${visitsCreated} визитов ---`);
    console.log('--- Тестовые данные созданы! ---');
  }
}
