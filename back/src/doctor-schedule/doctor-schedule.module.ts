import { Module } from '@nestjs/common'
import { DoctorScheduleController } from './doctor-schedule.controller'
import { DoctorScheduleService } from './doctor-schedule.service'
import { PrismaService } from '../prisma/prisma.service'
import { DoctorShiftService } from '../doctor-shift/doctor-shift.service'

@Module({
  controllers: [DoctorScheduleController],
  providers: [DoctorScheduleService, PrismaService, DoctorShiftService],
  exports: [DoctorScheduleService],
})
export class DoctorScheduleModule {}
