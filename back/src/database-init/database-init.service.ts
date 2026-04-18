import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

    // 1. Создаём докторов
    const doctors = await this.prisma.user.createManyAndReturn({
      data: [
        {
          username: 'doc1',
          email: 'doc1@mail.com',
          passwordHash: 'hash',
          role: 'DOCTOR',
        },
        {
          username: 'doc2',
          email: 'doc2@mail.com',
          passwordHash: 'hash',
          role: 'DOCTOR',
        },
        {
          username: 'doc3',
          email: 'doc3@mail.com',
          passwordHash: 'hash',
          role: 'DOCTOR',
        },
      ],
    });

    // 2. Создаём пациентов, привязывая к userId докторов
    await this.prisma.patient.createMany({
      data: [
        { name: 'Иван Иванов', phone: '+79990000001', userId: doctors[0].id },
        { name: 'Пётр Петров', phone: '+79990000002', userId: doctors[1].id },
        { name: 'Сидор Сидоров', phone: '+79990000003', userId: doctors[2].id },
      ],
    });

    // 3. Кабинеты
    await this.prisma.cabinet.createMany({
      data: [{ number: 101 }, { number: 102 }, { number: 103 }],
    });

    console.log('--- Тестовые данные созданы! ---');
  }
}
