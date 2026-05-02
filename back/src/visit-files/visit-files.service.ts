import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import { AttachedFile, Visit, Doctor, Patient } from '@prisma/client';

type Role = 'ADMIN' | 'DOCTOR' | 'PATIENT';

@Injectable()
export class VisitFilesService {
  constructor(private prisma: PrismaService) {}

  async upload(
    userSub: number,
    role: Role,
    visitId: number,
    file: Express.Multer.File,
  ): Promise<AttachedFile> {
    const visit = await this.prisma.visit.findUnique({
      where: { id: visitId },
    });

    if (!visit) {
      throw new NotFoundException('Визит не найден');
    }

    if (role === 'DOCTOR') {
      const doctor: Doctor | null = await this.prisma.doctor.findFirst({
        where: { userId: userSub },
      });

      if (!doctor || doctor.id !== visit.doctorId) {
        throw new ForbiddenException(
          'Вы не можете добавлять файлы в чужой визит',
        );
      }
    }

    return this.prisma.attachedFile.create({
      data: {
        visitId,
        fileType: file.mimetype,
        filePath: `/uploads/visits/${visitId}/${file.filename}`,
      },
    });
  }

  async getByVisit(
    userSub: number,
    role: Role,
    visitId: number,
  ): Promise<AttachedFile[]> {
    const visit = await this.prisma.visit.findUnique({
      where: { id: visitId },
      include: { attachedFiles: true },
    });

    if (!visit) {
      throw new NotFoundException('Визит не найден');
    }

    if (role === 'PATIENT') {
      const patient: Patient | null = await this.prisma.patient.findUnique({
        where: { userId: userSub },
      });

      if (!patient || patient.id !== visit.patientId) {
        throw new ForbiddenException('Вы не можете просматривать чужие файлы');
      }
    }

    if (role === 'DOCTOR') {
      const doctor: Doctor | null = await this.prisma.doctor.findFirst({
        where: { userId: userSub },
      });

      if (!doctor || doctor.id !== visit.doctorId) {
        throw new ForbiddenException('Вы не можете просматривать чужие файлы');
      }
    }

    return visit.attachedFiles;
  }

  async delete(userSub: number, role: Role, id: number): Promise<AttachedFile> {
    const file = await this.prisma.attachedFile.findUnique({ where: { id } });
    if (!file) {
      throw new NotFoundException('Файл не найден');
    }

    const visit: Visit | null = await this.prisma.visit.findUnique({
      where: { id: file.visitId },
    });

    if (!visit) {
      throw new NotFoundException('Визит не найден');
    }

    if (role === 'DOCTOR') {
      const doctor: Doctor | null = await this.prisma.doctor.findFirst({
        where: { userId: userSub },
      });

      if (!doctor || doctor.id !== visit.doctorId) {
        throw new ForbiddenException(
          'Вы не можете удалять файлы из чужого визита',
        );
      }
    }

    const fullPath = path.join(process.cwd(), file.filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    return this.prisma.attachedFile.delete({ where: { id } });
  }
}
