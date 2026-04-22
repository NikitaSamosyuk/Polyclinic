// src/users/users.service.ts
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async createUser(data: {
    email: string;
    username: string;
    password: string;
  }) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        passwordHash,
        role: 'PATIENT',
      },
    });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async getById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async updateAvatar(id: number, avatarUrl: string) {
    return this.prisma.user.update({
      where: { id },
      data: { avatarUrl },
      select: { id: true, avatarUrl: true },
    });
  }

  async update(id: number, data: { username?: string; email?: string }) {
    if (data.email) {
      const exists = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      if (exists && exists.id !== id) {
        throw new BadRequestException('Email already taken');
      }
    }
    return this.prisma.user.update({
      where: { id },
      data: { username: data.username, email: data.email },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatarUrl: true,
      },
    });
  }

  async changePassword(
    id: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new UnauthorizedException('User not found');
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Current password is incorrect');
    const newHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash: newHash },
    });
    return true;
  }

  async updatePasswordHash(id: number, passwordHash: string) {
    return this.prisma.user.update({ where: { id }, data: { passwordHash } });
  }
}
