import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VisitsService {
  constructor(private prisma: PrismaService) {}

  async create(doctorUserId: number, dto: any) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: doctorUserId },
    });

    if (!doctor) throw new BadRequestException('Доктор не найден');

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: dto.appointmentId },
    });

    if (!appointment) throw new BadRequestException('Приём не найден');

    if (appointment.doctorId !== doctor.id) {
      throw new BadRequestException('Доктор не ведёт этот приём');
    }

    return this.prisma.visit.create({
      data: {
        appointmentId: dto.appointmentId,
        patientId: appointment.patientId,
        doctorId: doctor.id,
        visitDatetime: new Date(dto.visitDatetime),
        complaints: dto.complaints,
        diagnosis: dto.diagnosis,
        examination: dto.examination,
        treatment: dto.treatment,
        recommendations: dto.recommendations,
      },
    });
  }

  async update(doctorUserId: number, id: number, dto: any) {
    const visit = await this.prisma.visit.findUnique({ where: { id } });

    if (!visit) throw new NotFoundException('Визит не найден');

    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: doctorUserId },
    });

    if (visit.doctorId !== doctor.id) {
      throw new BadRequestException('Доктор не ведёт этот визит');
    }

    return this.prisma.visit.update({
      where: { id },
      data: dto,
    });
  }

  async getById(id: number) {
    return this.prisma.visit.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: true,
        appointment: true,
        attachedFiles: true,
      },
    });
  }

  async getForPatient(userId: number) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId },
    });

    return this.prisma.visit.findMany({
      where: { patientId: patient.id },
      include: { doctor: true, appointment: true },
      orderBy: { visitDatetime: 'desc' },
    });
  }

  async getForDoctor(userId: number) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });

    return this.prisma.visit.findMany({
      where: { doctorId: doctor.id },
      include: { patient: true, appointment: true },
      orderBy: { visitDatetime: 'desc' },
    });
  }
}
