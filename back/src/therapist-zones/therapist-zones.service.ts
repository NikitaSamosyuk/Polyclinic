import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTherapistZoneDto } from './dto/create-zone.dto';
import { UpdateTherapistZoneDto } from './dto/update-zone.dto';

@Injectable()
export class TherapistZonesService {
  constructor(private prisma: PrismaService) {}

  // ---------------------------------------------------------
  // Получить все зоны
  // ---------------------------------------------------------
  async getAll() {
    return this.prisma.therapistAddressZone.findMany({
      include: { doctor: true },
      orderBy: { id: 'asc' },
    });
  }

  // ---------------------------------------------------------
  // Получить зоны по врачу
  // ---------------------------------------------------------
  async getByDoctor(doctorId: number) {
    return this.prisma.therapistAddressZone.findMany({
      where: { doctorId },
      orderBy: { id: 'asc' },
    });
  }

  // ---------------------------------------------------------
  // Получить зону по ID
  // ---------------------------------------------------------
  async getById(id: number) {
    const zone = await this.prisma.therapistAddressZone.findUnique({
      where: { id },
      include: { doctor: true },
    });

    if (!zone) throw new NotFoundException('Zone not found');
    return zone;
  }

  // ---------------------------------------------------------
  // Создать зону
  // ---------------------------------------------------------
  async create(dto: CreateTherapistZoneDto) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: dto.doctorId },
    });

    if (!doctor || !doctor.isTherapist) {
      throw new BadRequestException('Зону можно назначить только терапевту');
    }

    return this.prisma.therapistAddressZone.create({
      data: {
        doctorId: dto.doctorId,
        street: dto.street.trim().toLowerCase(),
        houses: dto.houses.map((h) => h.trim().toLowerCase()),
      },
    });
  }

  // ---------------------------------------------------------
  // Обновить зону
  // ---------------------------------------------------------
  async update(id: number, dto: UpdateTherapistZoneDto) {
    await this.getById(id);

    return this.prisma.therapistAddressZone.update({
      where: { id },
      data: {
        street: dto.street?.trim().toLowerCase(),
        houses: dto.houses?.map((h) => h.trim().toLowerCase()),
      },
    });
  }

  // ---------------------------------------------------------
  // Удалить зону
  // ---------------------------------------------------------
  async delete(id: number) {
    await this.getById(id);

    return this.prisma.therapistAddressZone.delete({
      where: { id },
    });
  }

  // ---------------------------------------------------------
  // Найти терапевта по адресу → выбрать самого незагруженного
  // ---------------------------------------------------------
  async findTherapistByAddress(street: string, house: string) {
    const s = street.trim().toLowerCase();
    const h = house.trim().toLowerCase();

    const zones = await this.prisma.therapistAddressZone.findMany({
      include: { doctor: true },
    });

    const matchedZones = [];

    // --- 1. Находим все подходящие зоны ---
    for (const z of zones) {
      if (z.street !== s) continue;

      for (const rule of z.houses) {
        // диапазон 5-20
        if (rule.includes('-')) {
          const [from, to] = rule.split('-').map(Number);
          const num = Number(h);
          if (num >= from && num <= to) {
            matchedZones.push(z);
            break;
          }
        }

        // точное совпадение дома
        if (rule === h) {
          matchedZones.push(z);
          break;
        }
      }
    }

    if (matchedZones.length === 0) return null;
    if (matchedZones.length === 1) return matchedZones[0];

    // --- 2. Несколько зон → выбираем самого незагруженного терапевта ---
    const therapistIds = matchedZones.map((z) => z.doctorId);

    const loads = await this.prisma.patient.groupBy({
      by: ['primaryTherapistId'],
      where: { primaryTherapistId: { in: therapistIds } },
      _count: { primaryTherapistId: true },
    });

    const loadMap = new Map<number, number>();

    // загрузка по терапевтам
    for (const l of loads) {
      loadMap.set(l.primaryTherapistId, l._count.primaryTherapistId);
    }

    // если у терапевта нет пациентов → загрузка = 0
    for (const id of therapistIds) {
      if (!loadMap.has(id)) loadMap.set(id, 0);
    }

    // --- 3. Находим терапевта с минимальной загрузкой ---
    let bestZone = matchedZones[0];
    let bestLoad = loadMap.get(bestZone.doctorId) ?? 0;

    for (const z of matchedZones) {
      const load = loadMap.get(z.doctorId) ?? 0;
      if (load < bestLoad) {
        bestLoad = load;
        bestZone = z;
      }
    }

    return bestZone;
  }
}
