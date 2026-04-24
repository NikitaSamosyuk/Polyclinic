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
      where: { role: 'DOCTOR' },
      orderBy: { id: 'asc' },
    });

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

    // ---------------------------------------------------------
    // 5. Смены докторов
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

    // ---------------------------------------------------------
    // 6. Адресные зоны терапевта (НОВАЯ СИСТЕМА)
    // ---------------------------------------------------------
    await this.prisma.therapistAddressZone.createMany({
      data: [
        {
          doctorId: doctorProfiles[0].id,
          street: 'ленина',
          houses: ['10', '12', '5-20'],
        },
        {
          doctorId: doctorProfiles[0].id,
          street: 'победы',
          houses: ['1', '3', '5'],
        },
        {
          doctorId: doctorProfiles[0].id,
          street: 'гагарина',
          houses: ['50', '52'],
        },
      ],
    });

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
      where: { role: 'PATIENT' },
      orderBy: { id: 'asc' },
    });

    // ---------------------------------------------------------
    // 8. Профили пациентов
    // ---------------------------------------------------------
    await this.prisma.patient.create({
      data: {
        userId: patientUsers[0].id,
        firstName: 'Алексей',
        lastName: 'Смирнов',
        middleName: 'Игоревич',
        birthDate: new Date('1990-05-12'),
        gender: 'MALE',
        phone: '+375291234567',

        region: 'Минская область',
        city: 'Минск',
        street: 'Ленина',
        houseNumber: '10',
        apartment: '15',

        medicalCardNumber: 'MC-001',
        primaryTherapistId: doctorProfiles[0].id,
      },
    });

    const fallbackTherapist = doctorProfiles.find((d) => d.isTherapist);

    await this.prisma.patient.create({
      data: {
        userId: patientUsers[1].id,
        firstName: 'Мария',
        lastName: 'Кузнецова',
        middleName: 'Андреевна',
        birthDate: new Date('1985-11-03'),
        gender: 'FEMALE',
        phone: '+375297654321',

        region: 'Гродненская область',
        city: 'Гродно',
        street: 'Советская',
        houseNumber: '5',
        apartment: '8',

        medicalCardNumber: 'MC-002',
        primaryTherapistId: fallbackTherapist.id,
      },
    });

    console.log('--- Тестовые данные созданы! ---');
  }
}
