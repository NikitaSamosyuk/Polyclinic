import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCabinetDto } from './dto/create-cabinet.dto';
import { UpdateCabinetDto } from './dto/update-cabinet.dto';

@Injectable()
export class CabinetsService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.cabinet.findMany({
      include: {
        doctors: true,
        shifts: true,
      },
      orderBy: { number: 'asc' },
    });
  }

  async getById(id: number) {
    const cabinet = await this.prisma.cabinet.findUnique({
      where: { id },
      include: {
        doctors: true,
        shifts: true,
      },
    });

    if (!cabinet) throw new NotFoundException('Cabinet not found');

    return cabinet;
  }

  async create(dto: CreateCabinetDto) {
    return this.prisma.cabinet.create({
      data: {
        number: dto.number,
        specialization: dto.specialization,
        workingHoursStart: dto.workingHoursStart,
        workingHoursEnd: dto.workingHoursEnd,
        slotDuration: dto.slotDuration ?? 30,
      },
    });
  }

  async update(id: number, dto: UpdateCabinetDto) {
    await this.getById(id);

    return this.prisma.cabinet.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: number) {
    await this.getById(id);

    return this.prisma.cabinet.delete({
      where: { id },
    });
  }
}
