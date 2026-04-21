import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTherapistZoneDto } from './dto/create-zone.dto';
import { UpdateTherapistZoneDto } from './dto/update-zone.dto';

@Injectable()
export class TherapistZonesService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.therapistAddressZone.findMany({
      include: {
        doctor: true,
      },
      orderBy: { id: 'asc' },
    });
  }

  async getByDoctor(doctorId: number) {
    return this.prisma.therapistAddressZone.findMany({
      where: { doctorId },
      orderBy: { id: 'asc' },
    });
  }

  async getById(id: number) {
    const zone = await this.prisma.therapistAddressZone.findUnique({
      where: { id },
      include: { doctor: true },
    });

    if (!zone) throw new NotFoundException('Zone not found');

    return zone;
  }

  async create(dto: CreateTherapistZoneDto) {
    return this.prisma.therapistAddressZone.create({
      data: {
        doctorId: dto.doctorId,
        zone: dto.zone,
      },
    });
  }

  async update(id: number, dto: UpdateTherapistZoneDto) {
    await this.getById(id);

    return this.prisma.therapistAddressZone.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: number) {
    await this.getById(id);

    return this.prisma.therapistAddressZone.delete({
      where: { id },
    });
  }

  // --- Найти терапевта по адресу пациента ---
  async findTherapistByAddress(address: string) {
    const zones = await this.prisma.therapistAddressZone.findMany();

    const match = zones.find((z) => address.includes(z.zone));

    return match || null;
  }
}
