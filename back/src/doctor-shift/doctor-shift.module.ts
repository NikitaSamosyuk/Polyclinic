import { Module } from '@nestjs/common'
import { DoctorShiftService } from './doctor-shift.service'
import { DoctorShiftController } from './doctor-shift.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [DoctorShiftController],
  providers: [DoctorShiftService],
  exports: [DoctorShiftService],
})
export class DoctorShiftModule {}
