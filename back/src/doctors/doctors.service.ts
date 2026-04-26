// src/doctors/doctors.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Doctor,
  User,
  Cabinet,
  Patient,
  TherapistAddressZone,
} from '@prisma/client';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

const DEFAULT_PHOTO = '/uploads/defaults/doctor.png';

type DoctorWithRelations = Doctor & {
  user?: User | null;
  cabinet?: Cabinet | null;
};

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  private withDefaultPhoto<T extends { photoUrl: string | null }>(
    doctor: T | null,
  ): T | null {
    if (!doctor) return doctor;
    return {
      ...doctor,
      photoUrl: doctor.photoUrl || DEFAULT_PHOTO,
    };
  }

  private withDefaultPhotoMany<T extends { photoUrl: string | null }>(
    doctors: T[],
  ): T[] {
    return doctors.map((d) => this.withDefaultPhoto(d) as T);
  }

  // --- список активных врачей ---
  async getAllActive(): Promise<DoctorWithRelations[]> {
    const doctors = await this.prisma.doctor.findMany({
      where: { user: { isActive: true } },
      include: { cabinet: true, user: true },
      orderBy: { lastName: 'asc' },
    });

    return this.withDefaultPhotoMany(doctors);
  }

  // --- врач по doctorId ---
  async getById(id: number): Promise<DoctorWithRelations> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: { cabinet: true, user: true },
    });

    if (!doctor) throw new NotFoundException('Doctor not found');

    return this.withDefaultPhoto(doctor)!;
  }

  // --- врач по userId ---
  async getByUserId(userId: number): Promise<DoctorWithRelations> {
    const doctor = await this.prisma.doctor.findFirst({
      where: { userId },
      include: { cabinet: true, user: true },
    });

    if (!doctor) throw new NotFoundException('Doctor not found');

    return this.withDefaultPhoto(doctor)!;
  }

  // --- обновить фото (только фото, по userId) ---
  async updatePhoto(userId: number, photoUrl: string): Promise<Doctor> {
    const doctor = await this.prisma.doctor.findFirst({ where: { userId } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    const updated = await this.prisma.doctor.update({
      where: { id: doctor.id },
      data: { photoUrl },
    });

    return this.withDefaultPhoto(updated)!;
  }

  // --- создать врача ---
  async createDoctor(dto: CreateDoctorDto): Promise<Doctor> {
    const doctor = await this.prisma.doctor.create({
      data: {
        userId: dto.userId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        middleName: dto.middleName ?? null,
        specialization: dto.specialization,
        isTherapist: dto.isTherapist ?? false,
        cabinetId: dto.cabinetId ?? null,
        phone: dto.phone ?? null,
        photoUrl: dto.photoUrl ?? null,
      },
    });

    return this.withDefaultPhoto(doctor)!;
  }

  // --- обновить врача (ограничено для DOCTOR: только ФИО) ---
  async updateDoctor(
    id: number,
    dto: UpdateDoctorDto,
    actorRole: 'ADMIN' | 'DOCTOR' | 'PATIENT',
    actorUserId?: number,
  ): Promise<Doctor> {
    // --- DOCTOR может менять только себя и только ФИО ---
    if (actorRole === 'DOCTOR') {
      const doctor = await this.prisma.doctor.findFirst({
        where: { userId: actorUserId },
      });

      if (!doctor || doctor.id !== id) {
        throw new ForbiddenException('You can edit only your own profile');
      }

      const data: Partial<Doctor> = {};
      if (dto.firstName !== undefined) data.firstName = dto.firstName;
      if (dto.lastName !== undefined) data.lastName = dto.lastName;
      if (dto.middleName !== undefined) data.middleName = dto.middleName;

      const updated = await this.prisma.doctor.update({
        where: { id },
        data,
      });

      return this.withDefaultPhoto(updated)!;
    }

    // --- ADMIN может менять всё ---
    const updated = await this.prisma.doctor.update({
      where: { id },
      data: dto,
    });

    return this.withDefaultPhoto(updated)!;
  }

  // --- деактивировать врача ---
  async deactivateDoctor(id: number): Promise<User> {
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
    actorRole: 'ADMIN' | 'DOCTOR' | 'PATIENT',
  ): Promise<(Patient & { user: User })[]> {
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
    actorRole: 'ADMIN' | 'DOCTOR' | 'PATIENT',
  ): Promise<TherapistAddressZone[]> {
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
      orderBy: { street: 'asc' },
    });
  }
}
