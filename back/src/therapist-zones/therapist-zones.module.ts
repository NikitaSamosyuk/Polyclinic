import { Module } from '@nestjs/common';
import { TherapistZonesController } from './therapist-zones.controller';
import { TherapistZonesService } from './therapist-zones.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TherapistZonesController],
  providers: [TherapistZonesService],
  exports: [TherapistZonesService],
})
export class TherapistZonesModule {}
