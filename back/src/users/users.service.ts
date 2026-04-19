import { Injectable } from '@nestjs/common';
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

  async updatePasswordHash(id: number, passwordHash: string) {
    return this.prisma.user.update({
      where: { id },
      data: { passwordHash },
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
    });
  }
}
