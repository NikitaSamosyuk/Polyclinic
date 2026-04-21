import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  // --- Создать запись ---
  async createFromSlot(patientUserId: number, dto: any) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId: patientUserId },
    });

    if (!patient) throw new BadRequestException('Пациент не найден');

    // Проверка пересечения
    const overlapping = await this.prisma.appointment.findFirst({
      where: {
        doctorId: dto.doctorId,
        appointmentDate: new Date(dto.appointmentDate),
        startTime: { lt: new Date(dto.endTime) },
        endTime: { gt: new Date(dto.startTime) },
      },
    });

    if (overlapping) {
      throw new BadRequestException('Слот уже занят');
    }

    return this.prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: dto.doctorId,
        cabinetId: dto.cabinetId,
        appointmentDate: new Date(dto.appointmentDate),
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        reason: dto.reason || null,
      },
    });
  }

  // --- Мои записи (пациент / врач) ---
  async getForUser(userId: number, role: string) {
    if (role === 'PATIENT') {
      const patient = await this.prisma.patient.findUnique({
        where: { userId },
      });

      return this.prisma.appointment.findMany({
        where: { patientId: patient.id },
        include: { doctor: true, cabinet: true },
        orderBy: { startTime: 'asc' },
      });
    }

    if (role === 'DOCTOR') {
      const doctor = await this.prisma.doctor.findUnique({
        where: { userId },
      });

      return this.prisma.appointment.findMany({
        where: { doctorId: doctor.id },
        include: { patient: true, cabinet: true },
        orderBy: { startTime: 'asc' },
      });
    }

    throw new BadRequestException('Недоступно');
  }

  // --- Все записи врача (для админа) ---
  async getForDoctor(doctorId: number) {
    return this.prisma.appointment.findMany({
      where: { doctorId },
      include: { patient: true, cabinet: true },
      orderBy: { startTime: 'asc' },
    });
  }

  // --- Все записи (для админа) ---
  async getAll() {
    return this.prisma.appointment.findMany({
      include: {
        doctor: true,
        patient: true,
        cabinet: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }

  // --- Удалить запись ---
  async delete(id: number) {
    const exists = await this.prisma.appointment.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Appointment not found');

    return this.prisma.appointment.delete({ where: { id } });
  }
}
