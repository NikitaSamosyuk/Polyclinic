// src/doctors/doctors.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  // --- список активных врачей ---
  async getAllActive() {
    return this.prisma.doctor.findMany({
      where: { user: { isActive: true } },
      include: { cabinet: true },
      orderBy: { lastName: 'asc' },
    });
  }

  // --- врач по doctorId ---
  async getById(id: number) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: { cabinet: true, user: true },
    });

    if (!doctor) throw new NotFoundException('Doctor not found');
    return doctor;
  }

  // --- врач по userId ---
  async getByUserId(userId: number) {
    const doctor = await this.prisma.doctor.findFirst({
      where: { userId },
      include: { cabinet: true, user: true },
    });

    if (!doctor) throw new NotFoundException('Doctor not found');
    return doctor;
  }

  // --- обновить фото ---
  async updatePhoto(userId: number, photoUrl: string) {
    const doctor = await this.prisma.doctor.findFirst({ where: { userId } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    return this.prisma.doctor.update({
      where: { id: doctor.id },
      data: { photoUrl },
    });
  }

  // --- создать врача ---
  async createDoctor(dto) {
    return this.prisma.doctor.create({
      data: {
        userId: dto.userId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        middleName: dto.middleName,
        specialization: dto.specialization,
        isTherapist: dto.isTherapist ?? false,
        cabinetId: dto.cabinetId ?? null,
        phone: dto.phone ?? null,
      },
    });
  }

  // --- обновить врача ---
  async updateDoctor(id: number, dto) {
    return this.prisma.doctor.update({
      where: { id },
      data: dto,
    });
  }

  // --- деактивировать врача ---
  async deactivateDoctor(id: number) {
    const doctor = await this.prisma.doctor.findUnique({ where: { id } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    return this.prisma.user.update({
      where: { id: doctor.userId },
      data: { isActive: false },
    });
  }

  // --- пациенты врача ---
  async getDoctorPatients(
    doctorId: number,
    actorUserId: number,
    actorRole: string,
  ) {
    if (actorRole === 'DOCTOR') {
      const doctor = await this.prisma.doctor.findFirst({
        where: { userId: actorUserId },
      });

      if (!doctor || doctor.id !== doctorId) {
        throw new ForbiddenException('You can view only your own patients');
      }
    }

    return this.prisma.patient.findMany({
      where: {
        OR: [
          { primaryTherapistId: doctorId },
          { appointments: { some: { doctorId } } },
          { visits: { some: { doctorId } } },
        ],
      },
      include: { user: true },
      orderBy: { lastName: 'asc' },
    });
  }

  // --- зоны терапевта ---
  async getDoctorZones(
    doctorId: number,
    actorUserId: number,
    actorRole: string,
  ) {
    if (actorRole === 'DOCTOR') {
      const doctor = await this.prisma.doctor.findFirst({
        where: { userId: actorUserId },
      });

      if (!doctor || doctor.id !== doctorId) {
        throw new ForbiddenException('You can view only your own zones');
      }
    }

    return this.prisma.therapistAddressZone.findMany({
      where: { doctorId },
      orderBy: { zone: 'asc' },
    });
  }
}
