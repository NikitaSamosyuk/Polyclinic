import { Module } from '@nestjs/common';
import { CabinetsController } from './cabinets.controller';
import { CabinetsService } from './cabinets.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CabinetsController],
  providers: [CabinetsService, PrismaService],
  exports: [CabinetsService],
})
export class CabinetsModule {}
