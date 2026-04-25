import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateCabinetDto } from './dto/create-cabinet.dto'
import { UpdateCabinetDto } from './dto/update-cabinet.dto'

@Injectable()
export class CabinetsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Получение всех кабинетов с врачами и сменами
   */
  async getAll(args: any = {}) {
    return this.prisma.cabinet.findMany({
      orderBy: { number: 'asc' },
      include: {
        doctors: true,
        shifts: {
          orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
          include: {
            doctor: true, // ← ВАЖНО: подгружаем врача для смены
          },
        },
      },
      ...args,
    })
  }

  /**
   * Получение кабинета по ID
   */
  async getById(id: number, args: any = {}) {
    const cabinet = await this.prisma.cabinet.findUnique({
      where: { id },
      include: {
        doctors: true,
        shifts: {
          orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
          include: {
            doctor: true, // ← тоже подгружаем врача
          },
        },
      },
      ...args,
    })

    if (!cabinet) {
      throw new NotFoundException('Кабинет не найден')
    }

    return cabinet
  }

  /**
   * Создание кабинета
   */
  async create(dto: CreateCabinetDto) {
    this.validateWorkingHours(dto.workingHoursStart, dto.workingHoursEnd)

    const specialization =
      dto.specialization && dto.specialization.trim().length > 0
        ? dto.specialization.trim()
        : 'Комбинированный'

    return this.prisma.cabinet.create({
      data: {
        number: dto.number.trim(),
        specialization,
        workingHoursStart: dto.workingHoursStart,
        workingHoursEnd: dto.workingHoursEnd,
        slotDuration: dto.slotDuration ?? 30,
      },
    })
  }

  /**
   * Обновление кабинета
   */
  async update(id: number, dto: UpdateCabinetDto) {
    const existing = await this.getById(id)

    const workingHoursStart = dto.workingHoursStart ?? existing.workingHoursStart
    const workingHoursEnd = dto.workingHoursEnd ?? existing.workingHoursEnd

    this.validateWorkingHours(workingHoursStart, workingHoursEnd)

    const specialization =
      dto.specialization !== undefined
        ? dto.specialization.trim().length > 0
          ? dto.specialization.trim()
          : 'Комбинированный'
        : existing.specialization

    return this.prisma.cabinet.update({
      where: { id },
      data: {
        specialization,
        workingHoursStart,
        workingHoursEnd,
        slotDuration: dto.slotDuration ?? existing.slotDuration,
        isActive: dto.isActive ?? existing.isActive,
      },
    })
  }

  /**
   * Логическая деактивация кабинета
   */
  async deactivate(id: number) {
    await this.getById(id)

    return this.prisma.cabinet.update({
      where: { id },
      data: {
        isActive: false,
      },
    })
  }

  /**
   * Проверка корректности рабочего времени
   */
  private validateWorkingHours(start: string, end: string): void {
    const [startH, startM] = start.split(':').map(Number)
    const [endH, endM] = end.split(':').map(Number)

    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM

    const minMinutes = 7 * 60 // 07:00
    const maxMinutes = 21 * 60 // 21:00

    if (startMinutes < minMinutes || endMinutes > maxMinutes) {
      throw new BadRequestException('Время работы кабинета должно быть в пределах 07:00–21:00')
    }

    if (endMinutes <= startMinutes) {
      throw new BadRequestException('Время окончания работы кабинета должно быть позже времени начала')
    }
  }
}
