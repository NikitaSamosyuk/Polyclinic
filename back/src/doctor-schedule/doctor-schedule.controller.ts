import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common'
import { DoctorScheduleService } from './doctor-schedule.service'
import { UpdateDoctorScheduleDto } from './dto/update-doctor-schedule.dto'
import { Request } from 'express'

interface AuthRequest extends Request {
  user?: {
    sub: number
    role: 'ADMIN' | 'DOCTOR' | 'PATIENT'
    iat?: number
    exp?: number
  }
}

@Controller('doctors/:doctorId/schedule')
export class DoctorScheduleController {
  constructor(private readonly schedule: DoctorScheduleService) {}

  @Get()
  async getSchedule(@Param('doctorId') doctorId: string) {
    return this.schedule.getSchedule(Number(doctorId))
  }

  @Patch()
  async updateSchedule(
    @Req() req: AuthRequest,
    @Param('doctorId') doctorId: string,
    @Body() dto: UpdateDoctorScheduleDto,
  ) {
    if (!req.user || req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Недостаточно прав для изменения расписания')
    }

    return this.schedule.updateSchedule(Number(doctorId), dto)
  }

  @Post('generate-period')
  async generatePeriod(
    @Req() req: AuthRequest,
    @Param('doctorId') doctorId: string,
    @Query('days') _days?: string, // параметр больше не используется
  ) {
    if (!req.user || req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Недостаточно прав для генерации смен')
    }

    // Генерируем смены только на текущую неделю (Пн–Пт)
    return this.schedule.generateShiftsForNextPeriod(Number(doctorId))
  }
}
