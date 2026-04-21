import { Module } from '@nestjs/common';
import { CabinetsController } from './cabinets.controller';
import { CabinetsService } from './cabinets.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CabinetsController],
  providers: [CabinetsService],
  exports: [CabinetsService],
})
export class CabinetsModule {}
