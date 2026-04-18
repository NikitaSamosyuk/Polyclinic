import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CabinetsService {
  constructor(private prisma: PrismaService) {}

  getAll() {
    return this.prisma.cabinet.findMany();
  }

  getOne(id: number) {
    return this.prisma.cabinet.findUnique({
      where: { id },
    });
  }

  create(dto: any) {
    return this.prisma.cabinet.create({
      data: dto,
    });
  }
}
