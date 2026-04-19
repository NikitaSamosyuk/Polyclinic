import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async getByUserId(userId: number) {
    return this.prisma.patient.findUnique({
      where: { userId },
    });
  }
}
