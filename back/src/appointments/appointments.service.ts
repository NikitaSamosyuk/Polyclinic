import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScheduleService } from '../schedule/schedule.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Appointment, Doctor, Patient, Cabinet } from '@prisma/client';

type AppointmentWithRelations = Appointment & {
  doctor: Doctor;
  patient: Patient;
  cabinet: Cabinet;
};

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly schedule: ScheduleService,
  ) {}

  private readonly fullInclude = {
    doctor: true,
    patient: true,
    cabinet: true,
  } as const;

  async create(
    patientUserId: number,
    dto: CreateAppointmentDto,
  ): Promise<AppointmentWithRelations> {
    const patient = await this.prisma.patient.findUnique({
      where: { userId: patientUserId },
    });

    if (!patient) {
      throw new BadRequestException('Пациент не найден');
    }

    const { doctorId, date, startTime } = dto;

    const shift = await this.schedule.getDoctorShift(doctorId, date);
    if (!shift) {
      throw new BadRequestException('Врач не работает в этот день');
    }

    const slots = await this.schedule.getSlotsForDoctor(doctorId, date);
    const slot = slots.slots.find((s) =>
      s.start.toISOString().includes(startTime),
    );

    if (!slot) {
      throw new BadRequestException('Слот не найден');
    }

    if (!slot.isFree) {
      throw new BadRequestException('Слот уже занят');
    }

    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(start.getTime() + shift.cabinet.slotDuration * 60_000);

    return this.prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId,
        cabinetId: shift.cabinetId,
        appointmentDate: new Date(date),
        startTime: start,
        endTime: end,
        reason: dto.reason ?? null,
      },
      include: this.fullInclude,
    }) as Promise<AppointmentWithRelations>;
  }

  async getAll(): Promise<AppointmentWithRelations[]> {
    return this.prisma.appointment.findMany({
      orderBy: [{ appointmentDate: 'asc' }, { startTime: 'asc' }],
      include: this.fullInclude,
    }) as Promise<AppointmentWithRelations[]>;
  }

  async getMy(
    userId: number,
    role: 'ADMIN' | 'DOCTOR' | 'PATIENT',
  ): Promise<AppointmentWithRelations[]> {
    if (role === 'PATIENT') {
      const patient = await this.prisma.patient.findUnique({
        where: { userId },
      });
      if (!patient) return [];

      return this.prisma.appointment.findMany({
        where: {
          patientId: patient.id,
        },
        orderBy: [{ appointmentDate: 'asc' }, { startTime: 'asc' }],
        include: this.fullInclude,
      }) as Promise<AppointmentWithRelations[]>;
    }

    if (role === 'DOCTOR') {
      const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
      if (!doctor) return [];

      return this.prisma.appointment.findMany({
        where: {
          doctorId: doctor.id,
        },
        orderBy: [{ appointmentDate: 'asc' }, { startTime: 'asc' }],
        include: this.fullInclude,
      }) as Promise<AppointmentWithRelations[]>;
    }

    return [];
  }

  async getByDoctorId(doctorId: number): Promise<AppointmentWithRelations[]> {
    return this.prisma.appointment.findMany({
      where: { doctorId },
      orderBy: [{ appointmentDate: 'asc' }, { startTime: 'asc' }],
      include: this.fullInclude,
    }) as Promise<AppointmentWithRelations[]>;
  }

  async cancelMy(userId: number, appointmentId: number): Promise<Appointment> {
    const patient = await this.prisma.patient.findUnique({
      where: { userId },
    });

    if (!patient) {
      throw new BadRequestException('Пациент не найден');
    }

    const appt = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appt) {
      throw new NotFoundException('Запись не найдена');
    }

    if (appt.patientId !== patient.id) {
      throw new ForbiddenException('Вы не можете отменить чужую запись');
    }

    return this.prisma.appointment.delete({
      where: { id: appointmentId },
    });
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private formatTime(date: Date): string {
    return date.toISOString().slice(11, 16);
  }

  async update(
    id: number,
    dto: UpdateAppointmentDto,
  ): Promise<AppointmentWithRelations> {
    const appt = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appt) {
      throw new NotFoundException('Запись не найдена');
    }

    let appointmentDate = appt.appointmentDate;
    let startTime = appt.startTime;
    let endTime = appt.endTime;

    const needReschedule =
      dto.date !== undefined || dto.startTime !== undefined;

    if (needReschedule) {
      const dateStr = dto.date ?? this.formatDate(appt.appointmentDate);
      const startTimeStr = dto.startTime ?? this.formatTime(appt.startTime);

      const shift = await this.schedule.getDoctorShift(appt.doctorId, dateStr);
      if (!shift) {
        throw new BadRequestException('Врач не работает в этот день');
      }

      const slots = await this.schedule.getSlotsForDoctor(
        appt.doctorId,
        dateStr,
      );
      const slot = slots.slots.find((s) =>
        s.start.toISOString().includes(startTimeStr),
      );

      if (!slot) {
        throw new BadRequestException('Слот не найден');
      }

      if (!slot.isFree) {
        throw new BadRequestException('Слот уже занят');
      }

      appointmentDate = new Date(dateStr);
      startTime = new Date(`${dateStr}T${startTimeStr}:00`);
      endTime = new Date(
        startTime.getTime() + shift.cabinet.slotDuration * 60_000,
      );
    }

    const data: Partial<Appointment> = {
      reason: dto.reason ?? appt.reason,
    };

    if (needReschedule) {
      data.appointmentDate = appointmentDate;
      data.startTime = startTime;
      data.endTime = endTime;
    }

    return this.prisma.appointment.update({
      where: { id },
      data,
      include: this.fullInclude,
    }) as Promise<AppointmentWithRelations>;
  }

  async delete(id: number): Promise<Appointment> {
    const appt = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appt) {
      throw new NotFoundException('Запись не найдена');
    }

    return this.prisma.appointment.delete({ where: { id } });
  }
}
