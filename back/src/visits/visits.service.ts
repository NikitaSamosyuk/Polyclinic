import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VisitsService {
  constructor(private prisma: PrismaService) {}

  create(dto: any) {
    return this.prisma.visit.create({
      data: {
        appointmentId: dto.appointmentId,
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        visitDatetime: new Date(dto.visitDatetime),
        complaints: dto.complaints,
        diagnosis: dto.diagnosis,
        examination: dto.examination,
        treatment: dto.treatment,
        recommendations: dto.recommendations,
      },
    });
  }

  attachFile(
    visitId: number,
    dto: { filePath: string; fileType: string; description?: string },
  ) {
    return this.prisma.attachedFile.create({
      data: {
        visitId,
        filePath: dto.filePath,
        fileType: dto.fileType,
        description: dto.description,
      },
    });
  }
}
