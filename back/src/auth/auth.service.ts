import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RedisService } from '../redis/redis.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
    private redis: RedisService,
  ) {}

  async register(dto: { username: string; email: string; password: string }) {
    const exists = await this.users.findByEmail(dto.email);
    if (exists) throw new ConflictException('Email already taken');

    // ✔ создаём пользователя (UsersService сам хэширует пароль)
    const user = await this.users.createUser({
      username: dto.username,
      email: dto.email,
      password: dto.password,
    });

    return this.issueTokens(user.id, user.role);
  }

  async login(dto: { email: string; password: string }) {
    const user = await this.users.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokens(user.id, user.role);
  }

  async issueTokens(userId: number, role: string) {
    const accessToken = await this.jwt.signAsync(
      { sub: userId, role },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' },
    );

    const refreshToken = await this.jwt.signAsync(
      { sub: userId },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
    );

    await this.redis.saveRefreshToken(userId, refreshToken, 60 * 60 * 24 * 7);

    return { accessToken, refreshToken };
  }

  async verifyRefreshToken(token: string) {
    return this.jwt.verifyAsync(token, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
  }

  async refresh(userId: number, token: string) {
    const stored = await this.redis.getRefreshToken(userId);
    if (!stored || stored !== token) throw new UnauthorizedException();

    const user = await this.users.findById(userId);

    return this.issueTokens(user.id, user.role);
  }

  async logout(userId: number) {
    await this.redis.deleteRefreshToken(userId);
  }
}
