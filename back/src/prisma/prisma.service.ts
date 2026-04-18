import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private client: any;

  // Проксируем ВСЕ модели Prisma
  public user: any;
  public patient: any;
  public doctor: any;
  public cabinet: any;
  public appointment: any;
  public visit: any;
  public attachedFile: any;

  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const adapter = new PrismaPg(pool);

    const { PrismaClient } = require('@prisma/client');

    this.client = new PrismaClient({ adapter });

    // Проксируем модели
    this.user = this.client.user;
    this.patient = this.client.patient;
    this.doctor = this.client.doctor;
    this.cabinet = this.client.cabinet;
    this.appointment = this.client.appointment;
    this.visit = this.client.visit;
    this.attachedFile = this.client.attachedFile;
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
