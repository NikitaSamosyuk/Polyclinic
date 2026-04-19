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

    // 1. Создаём пользователей-докторов
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

    // 2. Создаём кабинеты (минимально)
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

    // 3. Создаём профили докторов
    await this.prisma.doctor.createMany({
      data: [
        {
          userId: doctorUsers[0].id,
          firstName: 'Иван',
          lastName: 'Иванов',
          specialization: 'Терапевт',
          isTherapist: true,
          cabinetId: cabinets[0].id,
        },
        {
          userId: doctorUsers[1].id,
          firstName: 'Пётр',
          lastName: 'Петров',
          specialization: 'Хирург',
          isTherapist: false,
          cabinetId: cabinets[1].id,
        },
        {
          userId: doctorUsers[2].id,
          firstName: 'Сергей',
          lastName: 'Сергеев',
          specialization: 'Кардиолог',
          isTherapist: false,
          cabinetId: cabinets[2].id,
        },
      ],
    });

    console.log('--- Тестовые данные созданы! ---');

    const totalUsers = await this.prisma.user.count();
    console.log('Пользователей в базе:', totalUsers);
  }
}
