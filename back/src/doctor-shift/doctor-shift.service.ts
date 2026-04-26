import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { Cabinet, Doctor, DoctorShift } from '@prisma/client';

export type ShiftWithRelations = DoctorShift & {
  cabinet: Cabinet;
  doctor: Doctor;
};

@Injectable()
export class DoctorShiftService {
  constructor(private readonly prisma: PrismaService) {}

  private parseDate(date: string | Date): Date {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) {
      throw new BadRequestException('Некорректная дата');
    }
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  private validateTimeRange(startTime: string, endTime: string): void {
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);

    if (end <= start) {
      throw new BadRequestException(
        'Время окончания смены должно быть позже времени начала',
      );
    }

    const min = 7 * 60;
    const max = 21 * 60;

    if (start < min || end > max) {
      throw new BadRequestException('Смена должна быть в пределах 07:00–21:00');
    }
  }

  private validateWithinCabinet(
    start: string,
    end: string,
    cabinet: Cabinet,
  ): void {
    const s = this.timeToMinutes(start);
    const e = this.timeToMinutes(end);
    const cStart = this.timeToMinutes(cabinet.workingHoursStart);
    const cEnd = this.timeToMinutes(cabinet.workingHoursEnd);

    if (s < cStart || e > cEnd) {
      throw new BadRequestException(
        'Смена должна быть внутри рабочего времени кабинета',
      );
    }
  }

  private async ensureNoOverlap(
    doctorId: number,
    cabinetId: number,
    date: Date,
    startTime: string,
    endTime: string,
    excludeShiftId?: number,
  ): Promise<void> {
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);

    const doctorShifts = await this.prisma.doctorShift.findMany({
      where: {
        doctorId,
        date,
        ...(excludeShiftId ? { id: { not: excludeShiftId } } : {}),
      },
    });

    for (const s of doctorShifts) {
      const sStart = this.timeToMinutes(s.startTime);
      const sEnd = this.timeToMinutes(s.endTime);
      if (start < sEnd && end > sStart) {
        throw new BadRequestException(
          'Смена пересекается с другой сменой врача',
        );
      }
    }

    const cabinetShifts = await this.prisma.doctorShift.findMany({
      where: {
        cabinetId,
        date,
        ...(excludeShiftId ? { id: { not: excludeShiftId } } : {}),
      },
    });

    for (const s of cabinetShifts) {
      const sStart = this.timeToMinutes(s.startTime);
      const sEnd = this.timeToMinutes(s.endTime);
      if (start < sEnd && end > sStart) {
        throw new BadRequestException(
          'Смена пересекается с другой сменой в кабинете',
        );
      }
    }
  }

  async getById(id: number): Promise<ShiftWithRelations> {
    const shift = await this.prisma.doctorShift.findUnique({
      where: { id },
      include: { cabinet: true, doctor: true },
    });

    if (!shift) throw new NotFoundException('Смена не найдена');

    return shift;
  }

  async getMany(params: {
    doctorId?: number;
    cabinetId?: number;
    date?: string;
  }): Promise<ShiftWithRelations[]> {
    const where: {
      doctorId?: number;
      cabinetId?: number;
      date?: Date;
    } = {};

    if (params.doctorId !== undefined) where.doctorId = params.doctorId;
    if (params.cabinetId !== undefined) where.cabinetId = params.cabinetId;
    if (params.date !== undefined) where.date = this.parseDate(params.date);

    return this.prisma.doctorShift.findMany({
      where,
      include: { cabinet: true, doctor: true },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }

  async create(dto: CreateShiftDto): Promise<ShiftWithRelations> {
    const date = this.parseDate(dto.date);

    const isWeekendStub = dto.startTime === '00:00' && dto.endTime === '00:00';

    const cabinet = await this.prisma.cabinet.findUnique({
      where: { id: dto.cabinetId },
    });

    if (!cabinet) throw new BadRequestException('Кабинет не найден');
    if (!cabinet.isActive) throw new BadRequestException('Кабинет неактивен');

    if (!isWeekendStub) {
      this.validateTimeRange(dto.startTime, dto.endTime);
      this.validateWithinCabinet(dto.startTime, dto.endTime, cabinet);
      await this.ensureNoOverlap(
        dto.doctorId,
        dto.cabinetId,
        date,
        dto.startTime,
        dto.endTime,
      );
    }

    return this.prisma.doctorShift.create({
      data: {
        doctorId: dto.doctorId,
        cabinetId: dto.cabinetId,
        date,
        startTime: dto.startTime,
        endTime: dto.endTime,
      },
      include: { cabinet: true, doctor: true },
    });
  }

  async update(id: number, dto: UpdateShiftDto): Promise<ShiftWithRelations> {
    const existing = await this.prisma.doctorShift.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Смена не найдена');

    const doctorId = dto.doctorId ?? existing.doctorId;
    const cabinetId = dto.cabinetId ?? existing.cabinetId;
    const date = dto.date ? this.parseDate(dto.date) : existing.date;
    const startTime = dto.startTime ?? existing.startTime;
    const endTime = dto.endTime ?? existing.endTime;

    const isWeekendStub = startTime === '00:00' && endTime === '00:00';

    const cabinet = await this.prisma.cabinet.findUnique({
      where: { id: cabinetId },
    });
    if (!cabinet) throw new BadRequestException('Кабинет не найден');
    if (!cabinet.isActive) throw new BadRequestException('Кабинет неактивен');

    if (!isWeekendStub) {
      this.validateTimeRange(startTime, endTime);
      this.validateWithinCabinet(startTime, endTime, cabinet);
      await this.ensureNoOverlap(
        doctorId,
        cabinetId,
        date,
        startTime,
        endTime,
        id,
      );
    }

    return this.prisma.doctorShift.update({
      where: { id },
      data: {
        doctorId,
        cabinetId,
        date,
        startTime,
        endTime,
      },
      include: { cabinet: true, doctor: true },
    });
  }

  async delete(id: number): Promise<ShiftWithRelations> {
    return this.prisma.doctorShift.delete({
      where: { id },
      include: { cabinet: true, doctor: true },
    });
  }
}
