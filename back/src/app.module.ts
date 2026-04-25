import { Module, MiddlewareConsumer } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'

// Core
import { PrismaModule } from './prisma/prisma.module'
import { RedisModule } from './redis/redis.module'

// Auth & Users
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { CombinedAuthGuard } from './auth/guards/combined-auth.guard'
import { AccessLoggerMiddleware } from './auth/middleware/access-logger.middleware'

// Domain modules
import { DoctorsModule } from './doctors/doctors.module'
import { PatientsModule } from './patients/patients.module'
import { AppointmentsModule } from './appointments/appointments.module'
import { ScheduleModule } from './schedule/schedule.module'
import { CabinetsModule } from './cabinets/cabinets.module'
import { TherapistZonesModule } from './therapist-zones/therapist-zones.module'
import { VisitsModule } from './visits/visits.module'
import { VisitFilesModule } from './visit-files/visit-files.module'
import { DoctorShiftModule } from './doctor-shift/doctor-shift.module'

// NEW — weekly schedule module
import { DoctorScheduleModule } from './doctor-schedule/doctor-schedule.module'

// DB init
import { DatabaseInitService } from './database-init/database-init.service'

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

    DoctorShiftModule,
    DoctorScheduleModule, // ← ДОБАВЛЕН НОВЫЙ МОДУЛЬ
  ],
  controllers: [AppController],
  providers: [
    AppService,
    CombinedAuthGuard,
    DatabaseInitService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AccessLoggerMiddleware).forRoutes('*')
  }
}
