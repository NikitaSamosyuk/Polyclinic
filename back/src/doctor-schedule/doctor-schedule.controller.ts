import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { DoctorScheduleService } from './doctor-schedule.service';
import { UpdateDoctorScheduleDto } from './dto/update-doctor-schedule.dto';
import { Request } from 'express';
import { DoctorScheduleTemplate, DoctorShift } from '@prisma/client';

interface AuthRequest extends Request {
  user?: {
    sub: number;
    role: 'ADMIN' | 'DOCTOR' | 'PATIENT';
    iat?: number;
    exp?: number;
  };
}

@Controller('doctors/:doctorId/schedule')
export class DoctorScheduleController {
  constructor(private readonly schedule: DoctorScheduleService) {}

  @Get()
  async getSchedule(
    @Param('doctorId') doctorId: string,
  ): Promise<DoctorScheduleTemplate[]> {
    return this.schedule.getSchedule(Number(doctorId));
  }

  @Patch()
  async updateSchedule(
    @Req() req: AuthRequest,
    @Param('doctorId') doctorId: string,
    @Body() dto: UpdateDoctorScheduleDto,
  ): Promise<DoctorScheduleTemplate[]> {
    if (!req.user || req.user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Недостаточно прав для изменения расписания',
      );
    }

    return this.schedule.updateSchedule(Number(doctorId), dto);
  }

  @Post('generate-period')
  async generatePeriod(
    @Req() req: AuthRequest,
    @Param('doctorId') doctorId: string,
  ): Promise<DoctorShift[]> {
    if (!req.user || req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Недостаточно прав для генерации смен');
    }

    return this.schedule.generateShiftsForNextPeriod(Number(doctorId));
  }
}
