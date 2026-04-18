import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  getProfile(userId: number) {
    return this.prisma.patient.findUnique({
      where: { userId },
      include: {
        user: true,
        primaryTherapist: { include: { user: true } },
      },
    });
  }

  getAppointments(userId: number) {
    return this.prisma.appointment.findMany({
      where: { patient: { userId } },
      include: {
        doctor: { include: { user: true } },
        cabinet: true,
      },
    });
  }

  getVisits(userId: number) {
    return this.prisma.visit.findMany({
      where: { patient: { userId } },
      include: {
        doctor: { include: { user: true } },
        appointment: true,
        attachedFiles: true,
      },
    });
  }
}
