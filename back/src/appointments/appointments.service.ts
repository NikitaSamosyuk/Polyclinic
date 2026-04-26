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
import { Appointment } from '@prisma/client';

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
  };

  async create(
    patientUserId: number,
    dto: CreateAppointmentDto,
  ): Promise<Appointment> {
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
    });
  }

  async getAll() {
    return this.prisma.appointment.findMany({
      orderBy: [{ appointmentDate: 'asc' }, { startTime: 'asc' }],
      include: this.fullInclude,
    });
  }

  async getMy(userId: number, role: 'ADMIN' | 'DOCTOR' | 'PATIENT') {
    if (role === 'PATIENT') {
      const patient = await this.prisma.patient.findUnique({
        where: { userId },
      });
      if (!patient) return [];

      return this.prisma.appointment.findMany({
        where: {
          patientId: patient.id,
          appointmentDate: { gte: new Date() },
        },
        orderBy: [{ appointmentDate: 'asc' }, { startTime: 'asc' }],
        include: this.fullInclude,
      });
    }

    if (role === 'DOCTOR') {
      const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
      if (!doctor) return [];

      return this.prisma.appointment.findMany({
        where: {
          doctorId: doctor.id,
          appointmentDate: { gte: new Date() },
        },
        orderBy: [{ appointmentDate: 'asc' }, { startTime: 'asc' }],
        include: this.fullInclude,
      });
    }

    return [];
  }

  async getByDoctorId(doctorId: number) {
    return this.prisma.appointment.findMany({
      where: { doctorId },
      orderBy: [{ appointmentDate: 'asc' }, { startTime: 'asc' }],
      include: this.fullInclude,
    });
  }

  async cancelMy(userId: number, appointmentId: number) {
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

  async update(id: number, dto: UpdateAppointmentDto) {
    const appt = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appt) throw new NotFoundException('Запись не найдена');

    return this.prisma.appointment.update({
      where: { id },
      data: dto,
      include: this.fullInclude,
    });
  }

  async delete(id: number) {
    const appt = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appt) throw new NotFoundException('Запись не найдена');

    return this.prisma.appointment.delete({ where: { id } });
  }
}
