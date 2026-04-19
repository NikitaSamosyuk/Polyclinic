import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis/redis.module';
import { DatabaseInitModule } from './database-init/database-init.module';
import { PatientsModule } from './patients/patients.module';
import { DoctorsModule } from './doctors/doctors.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    PatientsModule,
    DoctorsModule, // 🔥 добавлено
    RedisModule,
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
