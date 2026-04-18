import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        patient: true,
        doctor: true,
      },
    });
  }

  findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      include: {
        patient: true,
        doctor: true,
      },
    });
  }

  createPatient(userData: any, patientData: any) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          ...userData,
          role: 'USER',
          patient: { create: patientData },
        },
      });

      return user;
    });
  }

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
}
