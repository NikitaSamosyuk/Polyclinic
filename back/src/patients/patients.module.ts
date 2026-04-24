import { Module } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TherapistZonesModule } from '../therapist-zones/therapist-zones.module';

@Module({
  imports: [
    PrismaModule,
    TherapistZonesModule, // ← ОБЯЗАТЕЛЬНО
  ],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}
