import { Module } from '@nestjs/common';
import { DatabaseInitService } from './database-init.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [DatabaseInitService],
})
export class DatabaseInitModule {}
