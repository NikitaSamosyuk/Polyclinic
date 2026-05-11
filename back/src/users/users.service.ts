import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        doctor: true,
        patient: true,
      },
    });
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
        role: Role.PATIENT,
      },
      include: {
        doctor: true,
        patient: true,
      },
    });
  }

  async createDoctorUser(data: {
    email: string;
    username: string;
    password: string;
  }) {
    const emailExists = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (emailExists) {
      throw new BadRequestException('Email already taken');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        passwordHash,
        role: Role.DOCTOR,
        isActive: true,
      },
      include: {
        doctor: true,
        patient: true,
      },
    });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        doctor: true,
        patient: true,
      },
    });
  }

  async getById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        doctor: true,
        patient: true,
      },
    });
  }

  async updateAvatar(id: number, avatarUrl: string) {
    return this.prisma.user.update({
      where: { id },
      data: { avatarUrl },
      select: { id: true, avatarUrl: true },
    });
  }

  async update(id: number, data: { username?: string; email?: string }) {
    const updateData: Record<string, any> = {};

    // --- Email остаётся уникальным ---
    if (data.email !== undefined) {
      const exists = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (exists && exists.id !== id) {
        throw new BadRequestException('Email already taken');
      }

      updateData.email = data.email;
    }

    // --- Username НЕ уникальный ---
    if (data.username !== undefined) {
      updateData.username = data.username;
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        doctor: true,
        patient: true,
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
    return this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }
}
