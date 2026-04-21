import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.doctor.findMany({
      include: {
        user: true,
        cabinet: true,
      },
    });
  }

  async getByUserId(userId: number) {
    const doctor = await this.prisma.doctor.findFirst({
      where: { userId },
      include: {
        user: true,
        cabinet: true,
      },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with userId=${userId} not found`);
    }

    return doctor;
  }

  async updatePhoto(userId: number, photoUrl: string) {
    const doctor = await this.prisma.doctor.findFirst({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with userId=${userId} not found`);
    }

    return this.prisma.doctor.update({
      where: { id: doctor.id },
      data: { photoUrl },
    });
  }
}
