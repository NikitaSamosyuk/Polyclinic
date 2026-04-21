import { Module } from '@nestjs/common';
import { VisitFilesController } from './visit-files.controller';
import { VisitFilesService } from './visit-files.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [VisitFilesController],
  providers: [VisitFilesService],
})
export class VisitFilesModule {}
