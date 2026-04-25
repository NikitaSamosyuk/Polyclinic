import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { UpdateDoctorScheduleDto } from './dto/update-doctor-schedule.dto'
import { DoctorShiftService } from '../doctor-shift/doctor-shift.service'

@Injectable()
export class DoctorScheduleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shifts: DoctorShiftService,
  ) {}

  async getSchedule(doctorId: number) {
    const doctor = await this.prisma.doctor.findUnique({ where: { id: doctorId } })
    if (!doctor) {
      throw new NotFoundException('Врач не найден')
    }

    return this.prisma.doctorScheduleTemplate.findMany({
      where: { doctorId },
      orderBy: { dayOfWeek: 'asc' },
    })
  }

  async updateSchedule(doctorId: number, dto: UpdateDoctorScheduleDto) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { cabinet: true },
    })

    if (!doctor) {
      throw new NotFoundException('Врач не найден')
    }

    if (!doctor.cabinetId || !doctor.cabinet) {
      throw new BadRequestException('У врача не назначен кабинет')
    }

    const daysSet = new Set(dto.days.map((d) => d.dayOfWeek))
    if (daysSet.size !== dto.days.length) {
      throw new BadRequestException('Дни недели не должны повторяться')
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.doctorScheduleTemplate.deleteMany({
        where: { doctorId },
      })

      await tx.doctorScheduleTemplate.createMany({
        data: dto.days.map((d) => ({
          doctorId,
          dayOfWeek: d.dayOfWeek,
          startTime: d.startTime,
          endTime: d.endTime,
        })),
      })
    })

    return this.getSchedule(doctorId)
  }

  /**
   * Базовая «актуальная» неделя (Пн–Пт):
   * - если сегодня Пн–Сб → текущая неделя
   * - если сегодня Вс → следующая неделя (Пн завтра)
   */
  private getBaseMonday(): Date {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const monday = new Date(today)
    const wd = today.getDay() // 0–6

    if (wd === 0) {
      // воскресенье → понедельник = завтра
      monday.setDate(today.getDate() + 1)
    } else {
      // Пн–Сб → обычный расчёт
      monday.setDate(today.getDate() - (wd - 1))
    }

    return monday
  }

  /**
   * Пн–Пт для N недель вперёд от базового понедельника.
   * Гарантированно N недель (5 * N дней).
   */
  private getWorkDaysForWeeks(weeks: number): Date[] {
    const baseMonday = this.getBaseMonday()
    const result: Date[] = []

    for (let w = 0; w < weeks; w++) {
      const monday = new Date(baseMonday)
      monday.setDate(baseMonday.getDate() + w * 7)

      for (let i = 0; i < 5; i++) {
        const d = new Date(monday)
        d.setDate(monday.getDate() + i)
        d.setHours(0, 0, 0, 0)
        result.push(d)
      }
    }

    return result
  }

  /**
   * Приводим шаблон к рабочему времени кабинета и делим смену,
   * если в кабинете несколько врачей.
   */
  private async splitShiftIfNeeded(
    doctorId: number,
    cabinetId: number,
    startTime: string,
    endTime: string,
  ) {
    const cabinet = await this.prisma.cabinet.findUnique({
      where: { id: cabinetId },
    })

    if (!cabinet) {
      throw new BadRequestException('Кабинет не найден')
    }

    const toMin = (t: string) => {
      const [h, m] = t.split(':').map(Number)
      return h * 60 + m
    }

    const toTime = (m: number) =>
      `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`

    let s = Math.max(toMin(startTime), toMin(cabinet.workingHoursStart))
    let e = Math.min(toMin(endTime), toMin(cabinet.workingHoursEnd))

    if (e <= s) {
      throw new BadRequestException('Шаблон врача выходит за рамки рабочего времени кабинета')
    }

    const doctors = await this.prisma.doctor.findMany({
      where: { cabinetId },
      orderBy: { id: 'asc' },
    })

    if (doctors.length <= 1) {
      return { startTime: toTime(s), endTime: toTime(e) }
    }

    const index = doctors.findIndex((d) => d.id === doctorId)
    const total = e - s
    const slice = Math.floor(total / doctors.length)

    const s2 = s + index * slice
    const e2 = s + (index + 1) * slice

    return {
      startTime: toTime(s2),
      endTime: toTime(e2),
    }
  }

  /**
   * Генерация смен на 4 недели вперёд от «актуальной» недели.
   * Старые смены не трогаем, дубликаты не создаём.
   */
  async generateShiftsForNextPeriod(doctorId: number) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { cabinet: true },
    })

    if (!doctor) {
      throw new NotFoundException('Врач не найден')
    }

    if (!doctor.cabinetId || !doctor.cabinet) {
      throw new BadRequestException('У врача не назначен кабинет')
    }

    const template = await this.prisma.doctorScheduleTemplate.findMany({
      where: { doctorId },
    })

    if (template.length === 0) {
      throw new BadRequestException('Для врача не задано расписание по дням недели')
    }

    const days = this.getWorkDaysForWeeks(4)

    for (const day of days) {
      const dayOfWeek = day.getDay() // 1–5
      const t = template.find((x) => x.dayOfWeek === dayOfWeek)
      if (!t) continue

      const existing = await this.prisma.doctorShift.findFirst({
        where: { doctorId, date: day },
      })

      if (existing) continue

      const { startTime, endTime } = await this.splitShiftIfNeeded(
        doctorId,
        doctor.cabinetId,
        t.startTime,
        t.endTime,
      )

      await this.shifts.create({
        doctorId,
        cabinetId: doctor.cabinetId,
        date: day,
        startTime,
        endTime,
      } as any)
    }

    return this.prisma.doctorShift.findMany({
      where: { doctorId },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    })
  }
}
