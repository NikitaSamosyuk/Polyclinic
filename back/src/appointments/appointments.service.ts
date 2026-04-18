import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(patientId: number, dto: CreateAppointmentDto) {
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);

    if (end <= start) {
      throw new BadRequestException('Время окончания должно быть позже начала');
    }

    // 1. Нельзя записаться в прошлое
    if (start < new Date()) {
      throw new BadRequestException('Нельзя записаться в прошлое');
    }

    // 2. Длительность не более 1 часа
    const diffMs = end.getTime() - start.getTime();
    const diffMin = diffMs / 1000 / 60;
    if (diffMin > 60) {
      throw new BadRequestException('Максимальная длительность записи — 1 час');
    }

    // 3. Проверка занятости врача
    const doctorBusy = await this.prisma.appointment.findFirst({
      where: {
        doctorId: dto.doctorId,
        AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }],
      },
    });

    if (doctorBusy) {
      throw new BadRequestException('Врач занят в это время');
    }

    // 4. Проверка занятости кабинета
    const cabinetBusy = await this.prisma.appointment.findFirst({
      where: {
        cabinetId: dto.cabinetId,
        AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }],
      },
    });

    if (cabinetBusy) {
      throw new BadRequestException('Кабинет занят в это время');
    }

    // 5. Проверка рабочего времени кабинета
    const cabinet = await this.prisma.cabinet.findUnique({
      where: { id: dto.cabinetId },
    });

    if (!cabinet) {
      throw new BadRequestException('Кабинет не найден');
    }

    const [h1, m1] = cabinet.workingHoursStart.split(':');
    const [h2, m2] = cabinet.workingHoursEnd.split(':');

    const workStart = new Date(start);
    const workEnd = new Date(start);

    workStart.setHours(Number(h1), Number(m1), 0);
    workEnd.setHours(Number(h2), Number(m2), 0);

    if (start < workStart || end > workEnd) {
      throw new BadRequestException('Запись вне рабочего времени кабинета');
    }

    // 6. Создание записи
    return this.prisma.appointment.create({
      data: {
        patientId,
        doctorId: dto.doctorId,
        cabinetId: dto.cabinetId,
        appointmentDate: start,
        startTime: start,
        endTime: end,
        reason: dto.reason,
      },
    });
  }

  cancel(id: number) {
    return this.prisma.appointment.update({
      where: { id },
      data: { status: 'cancelled' },
    });
  }
}
