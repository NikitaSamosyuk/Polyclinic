import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DoctorsModule } from './doctors/doctors.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AccessLoggerMiddleware } from './auth/middleware/access-logger.middleware';
import { CombinedAuthGuard } from './auth/guards/combined-auth.guard';
import { DatabaseInitService } from './database-init/database-init.service';
import { PatientsModule } from './patients/patients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ScheduleModule } from './schedule/schedule.module';
import { CabinetsModule } from './cabinets/cabinets.module';
import { TherapistZonesModule } from './therapist-zones/therapist-zones.module';
import { VisitsModule } from './visits/visits.module';
import { VisitFilesModule } from './visit-files/visit-files.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    AuthModule,
    UsersModule,
    DoctorsModule,
    PatientsModule,
    AppointmentsModule,
    ScheduleModule,
    CabinetsModule,
    TherapistZonesModule,
    VisitsModule,
    VisitFilesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    CombinedAuthGuard, // ← ОБЯЗАТЕЛЬНО
    DatabaseInitService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AccessLoggerMiddleware).forRoutes('*');
  }
}
