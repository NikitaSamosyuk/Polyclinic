// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  exports: [UsersService], // важно: экспортируем сервис для AuthModule
})
export class UsersModule {}
