import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  getAllDoctors() {
    return this.prisma.doctor.findMany({
      include: { user: true },
    });
  }

  getSchedule(doctorId: number) {
    return this.prisma.appointment.findMany({
      where: { doctorId },
      include: {
        patient: { include: { user: true } },
        cabinet: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }

  getProfile(userId: number) {
    return this.prisma.doctor.findUnique({
      where: { userId },
      include: { user: true },
    });
  }
}
