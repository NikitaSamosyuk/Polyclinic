import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterPatientDto } from './dto/register-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  // --- Регистрация пациента + автоматический терапевт ---
  async createPatient(userId: number, dto: RegisterPatientDto) {
    const exists = await this.prisma.patient.findUnique({
      where: { userId },
    });

    if (exists) {
      throw new BadRequestException('Patient profile already exists');
    }

    let primaryTherapistId: number | null = null;

    const isMinsk =
      dto.region === 'Минская область' &&
      dto.city.trim().toLowerCase() === 'минск';

    if (isMinsk) {
      const zone = await this.prisma.therapistAddressZone.findFirst({
        where: {
          zone: dto.street, // zone = название улицы
        },
      });

      if (zone) {
        primaryTherapistId = zone.doctorId;
      }
    }

    if (!primaryTherapistId) {
      const therapists = await this.prisma.doctor.findMany({
        where: { isTherapist: true },
        include: { patients: true },
      });

      if (therapists.length === 0) {
        throw new BadRequestException('No therapists available');
      }

      therapists.sort((a, b) => a.patients.length - b.patients.length);
      primaryTherapistId = therapists[0].id;
    }

    return this.prisma.patient.create({
      data: {
        userId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        middleName: dto.middleName,
        birthDate: new Date(dto.birthDate),
        gender: dto.gender,
        phone: dto.phone,

        // адрес — предполагаем, что поля есть в Prisma
        region: dto.region,
        city: dto.city,
        street: dto.street,
        houseNumber: dto.houseNumber,
        apartment: dto.apartment,

        primaryTherapistId,
      },
      include: {
        primaryTherapist: {
          include: { cabinet: true },
        },
        user: true,
      },
    });
  }

  // --- Профиль по userId (для /patients/me и /patients/user/:userId) ---
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

  // --- Профиль по patientId (для врача/админа) ---
  async getByIdForDoctorOrAdmin(
    patientId: number,
    actorUserId: number,
    actorRole: string,
  ) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        user: true,
        primaryTherapist: true,
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    if (actorRole === 'ADMIN') {
      return patient;
    }

    if (actorRole !== 'DOCTOR') {
      throw new ForbiddenException('Access denied');
    }

    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: actorUserId },
    });

    if (!doctor) {
      throw new ForbiddenException('Doctor profile not found');
    }

    const isTherapistPatient =
      patient.primaryTherapistId && patient.primaryTherapistId === doctor.id;

    const hasAppointment = await this.prisma.appointment.findFirst({
      where: {
        doctorId: doctor.id,
        patientId: patient.id,
      },
    });

    const hasVisit = await this.prisma.visit.findFirst({
      where: {
        doctorId: doctor.id,
        patientId: patient.id,
      },
    });

    if (!isTherapistPatient && !hasAppointment && !hasVisit) {
      throw new ForbiddenException('Access denied to this patient');
    }

    return patient;
  }

  // --- Список пациентов (для врача/админа) ---
  async getAllForDoctorOrAdmin(actorUserId: number, actorRole: string) {
    if (actorRole === 'ADMIN') {
      return this.prisma.patient.findMany({
        include: {
          user: true,
          primaryTherapist: true,
        },
        orderBy: { lastName: 'asc' },
      });
    }

    if (actorRole !== 'DOCTOR') {
      throw new ForbiddenException('Access denied');
    }

    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: actorUserId },
    });

    if (!doctor) {
      throw new ForbiddenException('Doctor profile not found');
    }

    const patients = await this.prisma.patient.findMany({
      where: {
        OR: [
          { primaryTherapistId: doctor.id },
          {
            appointments: {
              some: { doctorId: doctor.id },
            },
          },
          {
            visits: {
              some: { doctorId: doctor.id },
            },
          },
        ],
      },
      include: {
        user: true,
        primaryTherapist: true,
      },
      orderBy: { lastName: 'asc' },
    });

    return patients;
  }

  // --- Обновление профиля пациента ---
  async updatePatient(
    patientId: number,
    actorUserId: number,
    actorRole: string,
    dto: UpdatePatientDto,
  ) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    if (actorRole !== 'ADMIN' && patient.userId !== actorUserId) {
      throw new ForbiddenException('You can update only your own profile');
    }

    return this.prisma.patient.update({
      where: { id: patientId },
      data: {
        ...dto,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : patient.birthDate,
      },
      include: {
        user: true,
        primaryTherapist: true,
      },
    });
  }

  // --- Удаление пациента (только админ) ---
  async deletePatient(patientId: number) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return this.prisma.patient.delete({
      where: { id: patientId },
    });
  }

  // --- Поиск пациентов (ФИО / телефон / медкарта) ---
  async search(query: string, actorUserId: number, actorRole: string) {
    if (actorRole !== 'DOCTOR' && actorRole !== 'ADMIN') {
      throw new ForbiddenException('Access denied');
    }

    const whereBase = {
      OR: [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { middleName: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query } },
        { medicalCardNumber: { contains: query } },
      ],
    };

    if (actorRole === 'ADMIN') {
      return this.prisma.patient.findMany({
        where: whereBase,
        include: {
          user: true,
          primaryTherapist: true,
        },
        orderBy: { lastName: 'asc' },
      });
    }

    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: actorUserId },
    });

    if (!doctor) {
      throw new ForbiddenException('Doctor profile not found');
    }

    return this.prisma.patient.findMany({
      where: {
        AND: [
          whereBase,
          {
            OR: [
              { primaryTherapistId: doctor.id },
              {
                appointments: {
                  some: { doctorId: doctor.id },
                },
              },
              {
                visits: {
                  some: { doctorId: doctor.id },
                },
              },
            ],
          },
        ],
      },
      include: {
        user: true,
        primaryTherapist: true,
      },
      orderBy: { lastName: 'asc' },
    });
  }
}
