import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  createDoctor(userData: any, doctorData: any) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          ...userData,
          role: 'DOCTOR',
          doctor: { create: doctorData },
        },
      });

      return user;
    });
  }

  createCabinet(dto: any) {
    return this.prisma.cabinet.create({
      data: dto,
    });
  }
}
