import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import {
  Visit,
  Appointment,
  Doctor,
  Patient,
  AttachedFile,
} from '@prisma/client';

type VisitFull = Visit & {
  appointment: Appointment;
  doctor: Doctor;
  patient: Patient;
  attachedFiles: AttachedFile[];
};

@Injectable()
export class VisitsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeFull = {
    appointment: true,
    doctor: true,
    patient: true,
    attachedFiles: true,
  } as const;

  async create(
    userSub: number,
    role: 'ADMIN' | 'DOCTOR' | 'PATIENT',
    dto: CreateVisitDto,
  ): Promise<VisitFull> {
    const appt = await this.prisma.appointment.findUnique({
      where: { id: dto.appointmentId },
    });

    if (!appt) throw new NotFoundException('Запись не найдена');

    if (role === 'PATIENT')
      throw new ForbiddenException('Пациент не может создавать визиты');

    if (role === 'DOCTOR') {
      const doctor = await this.prisma.doctor.findFirst({
        where: { userId: userSub },
      });

      if (!doctor || doctor.id !== appt.doctorId)
        throw new ForbiddenException(
          'Вы не можете создать визит на чужую запись',
        );
    }

    const existing = await this.prisma.visit.findUnique({
      where: { appointmentId: appt.id },
    });

    if (existing)
      throw new BadRequestException('Визит по этой записи уже существует');

    return this.prisma.visit.create({
      data: {
        appointmentId: appt.id,
        doctorId: appt.doctorId,
        patientId: appt.patientId,
        visitDatetime: new Date(),
        complaints: dto.complaints ?? null,
        diagnosis: dto.diagnosis ?? null,
        examination: dto.examination ?? null,
        treatment: dto.treatment ?? null,
        recommendations: dto.recommendations ?? null,
      },
      include: this.includeFull,
    });
  }

  async getAll(
    userSub: number,
    role: 'ADMIN' | 'DOCTOR' | 'PATIENT',
  ): Promise<VisitFull[]> {
    if (role === 'PATIENT') return this.getMy(userSub, role);

    return this.prisma.visit.findMany({
      orderBy: { visitDatetime: 'desc' },
      include: this.includeFull,
    });
  }

  async getMy(
    userSub: number,
    role: 'ADMIN' | 'DOCTOR' | 'PATIENT',
  ): Promise<VisitFull[]> {
    if (role === 'PATIENT') {
      const patient = await this.prisma.patient.findUnique({
        where: { userId: userSub },
      });

      if (!patient) return [];

      return this.prisma.visit.findMany({
        where: { patientId: patient.id },
        orderBy: { visitDatetime: 'desc' },
        include: this.includeFull,
      });
    }

    if (role === 'DOCTOR') {
      const doctor = await this.prisma.doctor.findFirst({
        where: { userId: userSub },
      });

      if (!doctor) return [];

      return this.prisma.visit.findMany({
        where: { doctorId: doctor.id },
        orderBy: { visitDatetime: 'desc' },
        include: this.includeFull,
      });
    }

    return [];
  }

  async getById(
    id: number,
    userSub: number,
    role: 'ADMIN' | 'DOCTOR' | 'PATIENT',
  ): Promise<VisitFull> {
    const visit = await this.prisma.visit.findUnique({
      where: { id },
      include: this.includeFull,
    });

    if (!visit) throw new NotFoundException('Визит не найден');

    if (role === 'PATIENT') {
      const patient = await this.prisma.patient.findUnique({
        where: { userId: userSub },
      });

      if (!patient || patient.id !== visit.patientId)
        throw new ForbiddenException('Вы не можете просматривать чужой визит');
    }

    if (role === 'DOCTOR') {
      const doctor = await this.prisma.doctor.findFirst({
        where: { userId: userSub },
      });

      if (!doctor || doctor.id !== visit.appointment.doctorId)
        throw new ForbiddenException(
          'Вы не можете просматривать визит другого врача',
        );
    }

    return visit;
  }

  async update(
    id: number,
    userSub: number,
    role: 'ADMIN' | 'DOCTOR' | 'PATIENT',
    dto: UpdateVisitDto,
  ): Promise<VisitFull> {
    const visit = await this.prisma.visit.findUnique({
      where: { id },
      include: { appointment: true },
    });

    if (!visit) throw new NotFoundException('Визит не найден');

    if (role === 'DOCTOR') {
      const doctor = await this.prisma.doctor.findFirst({
        where: { userId: userSub },
      });

      if (!doctor || doctor.id !== visit.appointment.doctorId)
        throw new ForbiddenException(
          'Вы не можете редактировать визит другого врача',
        );
    }

    return this.prisma.visit.update({
      where: { id },
      data: {
        complaints: dto.complaints ?? visit.complaints,
        diagnosis: dto.diagnosis ?? visit.diagnosis,
        examination: dto.examination ?? visit.examination,
        treatment: dto.treatment ?? visit.treatment,
        recommendations: dto.recommendations ?? visit.recommendations,
      },
      include: this.includeFull,
    });
  }

  async delete(
    id: number,
    userSub: number,
    role: 'ADMIN' | 'DOCTOR' | 'PATIENT',
  ): Promise<Visit> {
    const visit = await this.prisma.visit.findUnique({
      where: { id },
      include: { appointment: true },
    });

    if (!visit) throw new NotFoundException('Визит не найден');

    if (role === 'DOCTOR') {
      const doctor = await this.prisma.doctor.findFirst({
        where: { userId: userSub },
      });

      if (!doctor || doctor.id !== visit.appointment.doctorId)
        throw new ForbiddenException(
          'Вы не можете удалять визит другого врача',
        );
    }

    return this.prisma.visit.delete({ where: { id } });
  }
}
