import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Cabinet } from '@prisma/client';
import { CreateCabinetDto } from './dto/create-cabinet.dto';
import { UpdateCabinetDto } from './dto/update-cabinet.dto';

@Injectable()
export class CabinetsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(args?: Prisma.CabinetFindManyArgs): Promise<Cabinet[]> {
    return this.prisma.cabinet.findMany({
      orderBy: { number: 'asc' },
      include: {
        doctors: true,
        shifts: {
          orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
          include: { doctor: true },
        },
      },
      ...args,
    });
  }

  async getById(
    id: number,
    args?: Omit<Prisma.CabinetFindUniqueArgs, 'where'>,
  ): Promise<Cabinet> {
    const cabinet = await this.prisma.cabinet.findUnique({
      where: { id },
      ...args,
    });

    if (!cabinet) {
      throw new NotFoundException('Кабинет не найден');
    }

    return cabinet;
  }

  async create(dto: CreateCabinetDto): Promise<Cabinet> {
    this.validateWorkingHours(dto.workingHoursStart, dto.workingHoursEnd);

    const specialization = dto.specialization?.trim() || 'Комбинированный';

    return this.prisma.cabinet.create({
      data: {
        number: dto.number.trim(),
        specialization,
        workingHoursStart: dto.workingHoursStart,
        workingHoursEnd: dto.workingHoursEnd,
        slotDuration: dto.slotDuration ?? 30,
      },
    });
  }

  async update(id: number, dto: UpdateCabinetDto): Promise<Cabinet> {
    const existing = await this.getById(id);

    const workingHoursStart =
      dto.workingHoursStart ?? existing.workingHoursStart;
    const workingHoursEnd = dto.workingHoursEnd ?? existing.workingHoursEnd;

    this.validateWorkingHours(workingHoursStart, workingHoursEnd);

    const specialization =
      dto.specialization !== undefined
        ? dto.specialization.trim() || 'Комбинированный'
        : existing.specialization;

    return this.prisma.cabinet.update({
      where: { id },
      data: {
        specialization,
        workingHoursStart,
        workingHoursEnd,
        slotDuration: dto.slotDuration ?? existing.slotDuration,
        isActive: dto.isActive ?? existing.isActive,
      },
    });
  }

  async deactivate(id: number): Promise<Cabinet> {
    await this.getById(id);

    return this.prisma.cabinet.update({
      where: { id },
      data: { isActive: false },
    });
  }

  private validateWorkingHours(start: string, end: string): void {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    const minMinutes = 7 * 60;
    const maxMinutes = 21 * 60;

    if (startMinutes < minMinutes || endMinutes > maxMinutes) {
      throw new BadRequestException(
        'Время работы кабинета должно быть в пределах 07:00–21:00',
      );
    }

    if (endMinutes <= startMinutes) {
      throw new BadRequestException(
        'Время окончания работы кабинета должно быть позже времени начала',
      );
    }
  }
}
