import { Module } from '@nestjs/common'
import { AppointmentsService } from './appointments.service'
import { AppointmentsController } from './appointments.controller'
import { PrismaModule } from '../prisma/prisma.module'
import { ScheduleModule } from '../schedule/schedule.module'

@Module({
  imports: [PrismaModule, ScheduleModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
})
export class AppointmentsModule {}
