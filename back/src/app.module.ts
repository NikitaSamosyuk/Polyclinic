// src/app.module.ts
import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis/redis.module';
import { PatientsModule } from './patients/patients.module';
import { DoctorsModule } from './doctors/doctors.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { VisitsModule } from './visits/visits.module';
import { AdminModule } from './admin/admin.module';
import { CabinetsModule } from './cabinets/cabinets.module';
import { DatabaseInitModule } from './database-init/database-init.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    RedisModule,
    PatientsModule,
    DoctorsModule,
    AppointmentsModule,
    VisitsModule,
    AdminModule,
    CabinetsModule,
    DatabaseInitModule,
  ],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap() {
    try {
      const count = await this.prisma.user.count();
      console.log('--- ✅ PRISMA ПРОВЕРКА УСПЕШНА ---');
      console.log(`Пользователей в базе: ${count}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error('--- ❌ ОШИБКА PRISMA ---', msg);
    }
  }
}
