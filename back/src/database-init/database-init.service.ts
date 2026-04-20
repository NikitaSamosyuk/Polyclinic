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
    // 1. Создаём АДМИНА
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
    // 2. Создаём обычных пользователей (пациентов)
    // ---------------------------------------------------------
    const patientUsers = await this.prisma.user.createManyAndReturn({
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

    console.log('Пациенты созданы:', patientUsers.length);

    // ---------------------------------------------------------
    // 3. Создаём пользователей-докторов
    // ---------------------------------------------------------
    const doctorUsers = await this.prisma.user.createManyAndReturn({
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

    console.log('Доктора-пользователи созданы:', doctorUsers.length);

    // ---------------------------------------------------------
    // 4. Создаём кабинеты
    // ---------------------------------------------------------
    const cabinets = await this.prisma.cabinet.createManyAndReturn({
      data: [
        {
          number: '101',
          specialization: 'Терапевт',
          workingHoursStart: '08:00',
          workingHoursEnd: '17:00',
        },
        {
          number: '102',
          specialization: 'Хирург',
          workingHoursStart: '09:00',
          workingHoursEnd: '18:00',
        },
        {
          number: '103',
          specialization: 'Кардиолог',
          workingHoursStart: '08:00',
          workingHoursEnd: '16:00',
        },
      ],
    });

    console.log('Кабинеты созданы:', cabinets.length);

    // ---------------------------------------------------------
    // 5. Создаём профили докторов (с отчествами!)
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
        },
        {
          userId: doctorUsers[1].id,
          firstName: 'Пётр',
          lastName: 'Петров',
          middleName: 'Петрович',
          specialization: 'Хирург',
          isTherapist: false,
          cabinetId: cabinets[1].id,
        },
        {
          userId: doctorUsers[2].id,
          firstName: 'Сергей',
          lastName: 'Сергеев',
          middleName: 'Сергеевич',
          specialization: 'Кардиолог',
          isTherapist: false,
          cabinetId: cabinets[2].id,
        },
      ],
    });

    console.log('Профили докторов созданы');

    console.log('--- Тестовые данные созданы! ---');
  }
}
