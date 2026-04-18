// src/redis/redis.module.ts
import { Global, Module } from '@nestjs/common';
import { RedisModule as NestRedisModule } from '@nestjs-modules/ioredis';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [
    NestRedisModule.forRoot({
      type: 'single',
      url: process.env.REDIS_URL || 'redis://redis:6379', // под docker-compose
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
