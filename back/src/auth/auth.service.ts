import { Injectable, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RedisService } from '../redis/redis.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  async register(dto: RegisterDto) {
    // 1. Проверка уникальности
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already taken');

    // 2. Хеширование
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // 3. Сохранение (User + Patient)
    const { password, lastName, firstName, birthDate, ...userData } = dto;

    return this.usersService.createPatient(
      { ...userData, passwordHash },
      { lastName, firstName, birthDate: new Date(birthDate) },
    );
  }
}
