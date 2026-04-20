import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  getByUserId(userId: number) {
    return this.prisma.doctor.findUnique({ where: { userId } });
  }

  updatePhoto(userId: number, photoUrl: string) {
    return this.prisma.doctor.update({
      where: { userId },
      data: { photoUrl },
    });
  }

  async getAll() {
    return this.prisma.doctor.findMany({
      include: {
        cabinet: true,
      },
    });
  }
}
