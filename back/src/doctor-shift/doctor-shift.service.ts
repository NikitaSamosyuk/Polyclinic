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

  // чистка смен врача после смены кабинета / по запросу
  async cleanupForDoctor(doctorId: number): Promise<number> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { cabinet: true },
    });

    if (!doctor) {
      throw new NotFoundException('Врач не найден');
    }

    // если врача перевели и cabinetId изменился — чистим все его смены
    const result = await this.prisma.doctorShift.deleteMany({
      where: { doctorId },
    });

    return result.count;
  }

  // автопродление по последнему расписанию
  private startOfDay(d: Date): Date {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  private addDays(d: Date, days: number): Date {
    const x = new Date(d);
    x.setDate(x.getDate() + days);
    return this.startOfDay(x);
  }

  private getMondayOfWeek(d: Date): Date {
    const x = this.startOfDay(d);
    const wd = x.getDay(); // 0 - вс, 1 - пн, ...
    const diff = wd === 0 ? -6 : 1 - wd; // смещение до понедельника
    x.setDate(x.getDate() + diff);
    return this.startOfDay(x);
  }

  async extendWeekFromLast(doctorId: number): Promise<ShiftWithRelations[]> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { cabinet: true },
    });

    if (!doctor) {
      throw new NotFoundException('Врач не найден');
    }
    if (!doctor.cabinetId || !doctor.cabinet) {
      throw new BadRequestException('У врача не назначен кабинет');
    }

    // находим последнюю смену врача
    const lastShift = await this.prisma.doctorShift.findFirst({
      where: { doctorId },
      orderBy: { date: 'desc' },
    });

    if (!lastShift) {
      throw new BadRequestException(
        'У врача нет смен для продления расписания',
      );
    }

    const lastWeekMonday = this.getMondayOfWeek(lastShift.date);
    const nextWeekMonday = this.addDays(lastWeekMonday, 7);
    const nextWeekSunday = this.addDays(nextWeekMonday, 6);

    // берём все смены за последнюю неделю
    const weekShifts = await this.prisma.doctorShift.findMany({
      where: {
        doctorId,
        date: {
          gte: lastWeekMonday,
          lte: this.startOfDay(this.addDays(lastWeekMonday, 6)),
        },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    if (weekShifts.length === 0) {
      throw new BadRequestException(
        'Не найдено смен за последнюю неделю для продления',
      );
    }

    // создаём смены на следующую неделю
    for (const s of weekShifts) {
      const offsetDays =
        (this.startOfDay(s.date).getTime() - lastWeekMonday.getTime()) /
        (1000 * 60 * 60 * 24);

      const newDate = this.addDays(nextWeekMonday, offsetDays);

      // пропускаем, если уже есть такая смена
      const exists = await this.prisma.doctorShift.findFirst({
        where: {
          doctorId,
          cabinetId: doctor.cabinetId,
          date: newDate,
          startTime: s.startTime,
          endTime: s.endTime,
        },
      });

      if (exists) continue;

      await this.create({
        doctorId,
        cabinetId: doctor.cabinetId,
        date: newDate,
        startTime: s.startTime,
        endTime: s.endTime,
      });
    }

    // возвращаем все смены врача в диапазоне новой недели
    return this.prisma.doctorShift.findMany({
      where: {
        doctorId,
        date: {
          gte: nextWeekMonday,
          lte: nextWeekSunday,
        },
      },
      include: { cabinet: true, doctor: true },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }
}
