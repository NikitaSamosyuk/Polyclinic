import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async getByUserId(userId: number) {
    const patient = await this.prisma.patient.findFirst({
      where: { userId },
      include: {
        user: true,
        primaryTherapist: {
          include: {
            cabinet: true,
          },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with userId=${userId} not found`);
    }

    return patient;
  }

  async getAll() {
    return this.prisma.patient.findMany({
      include: {
        user: true,
        primaryTherapist: {
          include: {
            cabinet: true,
          },
        },
      },
      orderBy: { lastName: 'asc' },
    });
  }
}
