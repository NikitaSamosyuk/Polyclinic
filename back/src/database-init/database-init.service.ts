import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DatabaseInitService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    const usersCount = await this.prisma.user.count();

    if (usersCount > 0) {
      console.log('--- Тестовые данные уже существуют ---');
      return;
    }

    console.log('--- Создаём тестовые данные... ---');

    // ---------------------------------------------------------
    // 1. Админ
    // ---------------------------------------------------------
    const admin = await this.prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@mail.com',
        passwordHash: await bcrypt.hash('admin123', 10),
        role: 'ADMIN',
      },
    });

    console.log('Админ создан:', admin.email);

    // ---------------------------------------------------------
    // 2. Доктора (User)
    // ---------------------------------------------------------
    await this.prisma.user.createMany({
      data: [
        {
          username: 'doc1',
          email: 'doc1@mail.com',
          passwordHash: await bcrypt.hash('123456', 10),
          role: 'DOCTOR',
        },
        {
          username: 'doc2',
          email: 'doc2@mail.com',
          passwordHash: await bcrypt.hash('123456', 10),
          role: 'DOCTOR',
        },
        {
          username: 'doc3',
          email: 'doc3@mail.com',
          passwordHash: await bcrypt.hash('123456', 10),
          role: 'DOCTOR',
        },
      ],
    });

    const doctorUsers = await this.prisma.user.findMany({
      where: { username: { in: ['doc1', 'doc2', 'doc3'] } },
      orderBy: { id: 'asc' },
    });

    console.log('Доктора-пользователи созданы:', doctorUsers.length);

    // ---------------------------------------------------------
    // 3. Кабинеты
    // ---------------------------------------------------------
    await this.prisma.cabinet.createMany({
      data: [
        {
          number: '101',
          specialization: 'Терапевт',
          workingHoursStart: '08:00',
          workingHoursEnd: '17:00',
          slotDuration: 30,
        },
        {
          number: '102',
          specialization: 'Хирург',
          workingHoursStart: '09:00',
          workingHoursEnd: '18:00',
          slotDuration: 20,
        },
        {
          number: '103',
          specialization: 'Кардиолог',
          workingHoursStart: '08:00',
          workingHoursEnd: '16:00',
          slotDuration: 40,
        },
      ],
    });

    const cabinets = await this.prisma.cabinet.findMany({
      orderBy: { id: 'asc' },
    });

    console.log('Кабинеты созданы:', cabinets.length);

    // ---------------------------------------------------------
    // 4. Профили докторов
    // ---------------------------------------------------------
    await this.prisma.doctor.createMany({
      data: [
        {
          userId: doctorUsers[0].id,
          firstName: 'Иван',
          lastName: 'Иванов',
          middleName: 'Иванович',
          specialization: 'Терапевт',
          isTherapist: true,
          cabinetId: cabinets[0].id,
          photoUrl: '/uploads/doctors/doc1.jpg',
        },
        {
          userId: doctorUsers[1].id,
          firstName: 'Пётр',
          lastName: 'Петров',
          middleName: 'Петрович',
          specialization: 'Хирург',
          isTherapist: false,
          cabinetId: cabinets[1].id,
          photoUrl: '/uploads/doctors/doc2.jpg',
        },
        {
          userId: doctorUsers[2].id,
          firstName: 'Сергей',
          lastName: 'Сергеев',
          middleName: 'Сергеевич',
          specialization: 'Кардиолог',
          isTherapist: false,
          cabinetId: cabinets[2].id,
          photoUrl: '/uploads/doctors/doc3.jpg',
        },
      ],
    });

    const doctorProfiles = await this.prisma.doctor.findMany({
      orderBy: { id: 'asc' },
    });

    console.log('Профили докторов созданы');

    // ---------------------------------------------------------
    // 5. Смены докторов (DoctorShift)
    // ---------------------------------------------------------
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    await this.prisma.doctorShift.createMany({
      data: [
        {
          doctorId: doctorProfiles[0].id,
          cabinetId: cabinets[0].id,
          date: today,
          startTime: '09:00',
          endTime: '15:00',
        },
        {
          doctorId: doctorProfiles[1].id,
          cabinetId: cabinets[1].id,
          date: today,
          startTime: '12:00',
          endTime: '18:00',
        },
        {
          doctorId: doctorProfiles[2].id,
          cabinetId: cabinets[2].id,
          date: tomorrow,
          startTime: '08:00',
          endTime: '14:00',
        },
      ],
    });

    console.log('Смены докторов созданы');

    // ---------------------------------------------------------
    // 6. Адресные зоны терапевта
    // ---------------------------------------------------------
    await this.prisma.therapistAddressZone.createMany({
      data: [
        {
          doctorId: doctorProfiles[0].id,
          zone: 'Ленина',
        },
        {
          doctorId: doctorProfiles[0].id,
          zone: 'Победы',
        },
      ],
    });

    console.log('Адресные зоны терапевта созданы');

    // ---------------------------------------------------------
    // 7. Пациенты (User)
    // ---------------------------------------------------------
    await this.prisma.user.createMany({
      data: [
        {
          username: 'user1',
          email: 'user1@mail.com',
          passwordHash: await bcrypt.hash('123456', 10),
          role: 'PATIENT',
        },
        {
          username: 'user2',
          email: 'user2@mail.com',
          passwordHash: await bcrypt.hash('123456', 10),
          role: 'PATIENT',
        },
      ],
    });

    const patientUsers = await this.prisma.user.findMany({
      where: { username: { in: ['user1', 'user2'] } },
      orderBy: { id: 'asc' },
    });

    console.log('Пациенты созданы:', patientUsers.length);

    // ---------------------------------------------------------
    // 8. Профили пациентов
    // ---------------------------------------------------------
    await this.prisma.patient.createMany({
      data: [
        {
          userId: patientUsers[0].id,
          firstName: 'Алексей',
          lastName: 'Смирнов',
          middleName: 'Игоревич',
          birthDate: new Date('1990-05-12'),
          gender: 'male',
          phone: '+79991234567',
          address: 'ул. Ленина, 10',
          medicalCardNumber: 'MC-001',
          primaryTherapistId: doctorProfiles[0].id,
        },
        {
          userId: patientUsers[1].id,
          firstName: 'Мария',
          lastName: 'Кузнецова',
          middleName: 'Андреевна',
          birthDate: new Date('1985-11-03'),
          gender: 'female',
          phone: '+79997654321',
          address: 'ул. Победы, 5',
          medicalCardNumber: 'MC-002',
          primaryTherapistId: doctorProfiles[0].id,
        },
      ],
    });

    console.log('Профили пациентов созданы');

    // Получаем реальные patient профили (нужны id для FK)
    const patientProfiles = await this.prisma.patient.findMany({
      orderBy: { id: 'asc' },
    });

    // ---------------------------------------------------------
    // 9. Тестовые записи (Appointments)
    // ---------------------------------------------------------
    await this.prisma.appointment.createMany({
      data: [
        {
          patientId: patientProfiles[0].id,
          doctorId: doctorProfiles[0].id,
          cabinetId: cabinets[0].id,
          appointmentDate: today,
          startTime: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            10,
            0,
          ),
          endTime: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            10,
            30,
          ),
          reason: 'Первичный осмотр',
        },
        {
          patientId: patientProfiles[1].id,
          doctorId: doctorProfiles[0].id,
          cabinetId: cabinets[0].id,
          appointmentDate: today,
          startTime: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            11,
            0,
          ),
          endTime: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            11,
            30,
          ),
          reason: 'Повторный приём',
        },
      ],
    });

    console.log('Тестовые записи созданы');

    console.log('--- Тестовые данные созданы! ---');
  }
}
