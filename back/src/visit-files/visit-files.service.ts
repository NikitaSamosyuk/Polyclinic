import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VisitFilesService {
  constructor(private prisma: PrismaService) {}

  async upload(visitId: number, file: any, description?: string) {
    const visit = await this.prisma.visit.findUnique({
      where: { id: visitId },
    });
    if (!visit) throw new NotFoundException('Visit not found');

    return this.prisma.attachedFile.create({
      data: {
        visitId,
        fileType: file.mimetype,
        filePath: `/uploads/visits/${file.filename}`,
        description,
      },
    });
  }

  async getFiles(visitId: number) {
    return this.prisma.attachedFile.findMany({
      where: { visitId },
    });
  }

  async delete(id: number) {
    return this.prisma.attachedFile.delete({
      where: { id },
    });
  }
}
