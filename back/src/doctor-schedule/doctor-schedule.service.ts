import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DoctorScheduleTemplate, DoctorShift } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateDoctorScheduleDto } from './dto/update-doctor-schedule.dto';
import { DoctorShiftService } from '../doctor-shift/doctor-shift.service';

@Injectable()
export class DoctorScheduleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shifts: DoctorShiftService,
  ) {}

  // Получение шаблона расписания
  async getSchedule(doctorId: number): Promise<DoctorScheduleTemplate[]> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new NotFoundException('Врач не найден');
    }

    return this.prisma.doctorScheduleTemplate.findMany({
      where: { doctorId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  // Обновление шаблона расписания
  async updateSchedule(
    doctorId: number,
    dto: UpdateDoctorScheduleDto,
  ): Promise<DoctorScheduleTemplate[]> {
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

    const daysSet = new Set(dto.days.map((d) => d.dayOfWeek));
    if (daysSet.size !== dto.days.length) {
      throw new BadRequestException('Дни недели не должны повторяться');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.doctorScheduleTemplate.deleteMany({
        where: { doctorId },
      });

      await tx.doctorScheduleTemplate.createMany({
        data: dto.days.map((d) => ({
          doctorId,
          dayOfWeek: d.dayOfWeek,
          startTime: d.startTime,
          endTime: d.endTime,
        })),
      });
    });

    return this.getSchedule(doctorId);
  }

  // Вспомогательные методы: локальные даты
  private startOfDayLocal(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  }

  private endOfDayLocal(d: Date): Date {
    return new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      23,
      59,
      59,
      999,
    );
  }

  private getBaseMondayLocal(): Date {
    const today = new Date();
    const todayStart = this.startOfDayLocal(today);

    // JS: 0 - вс, 1 - пн, ... 6 - сб
    const wd = todayStart.getDay();
    // смещение до понедельника (1)
    const diffToMonday = (wd + 6) % 7; // пн -> 0, вт -> 1, ..., вс -> 6

    const monday = new Date(todayStart);
    monday.setDate(todayStart.getDate() - diffToMonday);
    return this.startOfDayLocal(monday);
  }

  /**
   * Генерируем рабочие дни (Пн–Пт) на N недель вперёд
   * Всегда от понедельника текущей недели.
   */
  private getWorkDaysForWeeks(weeks: number): Date[] {
    const baseMonday = this.getBaseMondayLocal();
    const result: Date[] = [];

    for (let w = 0; w < weeks; w++) {
      const monday = new Date(baseMonday);
      monday.setDate(baseMonday.getDate() + w * 7);

      for (let i = 0; i < 5; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        result.push(this.startOfDayLocal(d));
      }
    }

    return result;
  }

  private async splitShiftIfNeeded(
    doctorId: number,
    cabinetId: number,
    startTime: string,
    endTime: string,
  ): Promise<{ startTime: string; endTime: string }> {
    const cabinet = await this.prisma.cabinet.findUnique({
      where: { id: cabinetId },
    });

    if (!cabinet) {
      throw new BadRequestException('Кабинет не найден');
    }

    const toMin = (t: string): number => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const toTime = (m: number): string =>
      `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

    const s = Math.max(toMin(startTime), toMin(cabinet.workingHoursStart));
    const e = Math.min(toMin(endTime), toMin(cabinet.workingHoursEnd));

    if (e <= s) {
      throw new BadRequestException(
        'Шаблон врача выходит за рамки рабочего времени кабинета',
      );
    }

    const doctors = await this.prisma.doctor.findMany({
      where: { cabinetId },
      orderBy: { id: 'asc' },
    });

    if (doctors.length <= 1) {
      return { startTime: toTime(s), endTime: toTime(e) };
    }

    const index = doctors.findIndex((d) => d.id === doctorId);
    if (index === -1) {
      return { startTime: toTime(s), endTime: toTime(e) };
    }

    const total = e - s;
    const slice = Math.floor(total / doctors.length);

    const s2 = s + index * slice;
    const e2 = s + (index + 1) * slice;

    return {
      startTime: toTime(s2),
      endTime: toTime(e2),
    };
  }

  // Очистка расписания врача
  async clearScheduleAndShiftsForDoctor(doctorId: number): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.doctorScheduleTemplate.deleteMany({ where: { doctorId } });
      await tx.doctorShift.deleteMany({ where: { doctorId } });
    });
  }

  // Генерация смен по шаблону (4 недели)
  async generateShiftsForNextPeriod(doctorId: number): Promise<DoctorShift[]> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { cabinet: true },
    });

    if (!doctor) throw new NotFoundException('Врач не найден');
    if (!doctor.cabinetId || !doctor.cabinet)
      throw new BadRequestException('У врача не назначен кабинет');

    const template = await this.prisma.doctorScheduleTemplate.findMany({
      where: { doctorId },
    });

    if (template.length === 0) {
      throw new BadRequestException(
        'Для врача не задано расписание по дням недели',
      );
    }

    const days = this.getWorkDaysForWeeks(4);

    for (const day of days) {
      const dayStart = this.startOfDayLocal(day);
      const dayEnd = this.endOfDayLocal(day);

      // Проверяем, есть ли уже смена в этот день (по дате)
      const existing = await this.prisma.doctorShift.findFirst({
        where: {
          doctorId,
          date: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      });

      if (existing) continue;

      // dayOfWeek: 1 - пн, ... 7 - вс
      const jsDay = dayStart.getDay(); // 0 - вс, 1 - пн, ...
      const dayOfWeek = jsDay === 0 ? 7 : jsDay;

      const t = template.find((x) => x.dayOfWeek === dayOfWeek);
      if (!t) continue;

      const { startTime, endTime } = await this.splitShiftIfNeeded(
        doctorId,
        doctor.cabinetId,
        t.startTime,
        t.endTime,
      );

      await this.shifts.create({
        doctorId,
        cabinetId: doctor.cabinetId,
        date: dayStart,
        startTime,
        endTime,
      });
    }

    return this.prisma.doctorShift.findMany({
      where: { doctorId },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }

  // Автопродление недели
  async extendWeek(doctorId: number) {
    return this.shifts.extendWeekFromLast(doctorId);
  }
}
