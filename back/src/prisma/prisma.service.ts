import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private client: any;

  public user: any;
  public patient: any;
  public doctor: any;
  public cabinet: any;
  public appointment: any;
  public visit: any;
  public attachedFile: any;

  public doctorShift: any;
  public therapistAddressZone: any;

  // 🔥 ДОБАВЛЕНО — ЭТОГО НЕ ХВАТАЛО
  public doctorScheduleTemplate: any;

  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const adapter = new PrismaPg(pool);

    const { PrismaClient } = require('@prisma/client');

    this.client = new PrismaClient({ adapter });

    this.user = this.client.user;
    this.patient = this.client.patient;
    this.doctor = this.client.doctor;
    this.cabinet = this.client.cabinet;
    this.appointment = this.client.appointment;
    this.visit = this.client.visit;
    this.attachedFile = this.client.attachedFile;

    this.doctorShift = this.client.doctorShift;
    this.therapistAddressZone = this.client.therapistAddressZone;

    // 🔥 ДОБАВЛЕНО — ПРОКСИРУЕМ МОДЕЛЬ
    this.doctorScheduleTemplate = this.client.doctorScheduleTemplate;
  }

  $transaction(...args: any[]) {
    return this.client.$transaction(...args);
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
