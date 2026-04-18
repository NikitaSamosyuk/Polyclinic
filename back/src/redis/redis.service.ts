import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  // Сохраняем токен. Ключ: refresh:ID_ПОЛЬЗОВАТЕЛЯ. TTL в секундах.
  async saveRefreshToken(
    userId: number,
    token: string,
    ttl: number,
  ): Promise<void> {
    await this.redis.set(`refresh:${userId}`, token, 'EX', ttl);
  }

  // Получаем токен для проверки при обновлении пары access/refresh
  async getRefreshToken(userId: number): Promise<string | null> {
    return this.redis.get(`refresh:${userId}`);
  }

  // Удаляем токен при выходе (Logout)
  async deleteRefreshToken(userId: number): Promise<void> {
    await this.redis.del(`refresh:${userId}`);
  }
}
