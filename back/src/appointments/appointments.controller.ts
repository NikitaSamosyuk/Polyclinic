import { Body, Controller, ForbiddenException, Post, Req } from '@nestjs/common'
import { AppointmentsService } from './appointments.service'
import { Request } from 'express'

interface AuthRequest extends Request {
  user?: {
    sub: number
    role: 'ADMIN' | 'DOCTOR' | 'PATIENT'
  }
}

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointments: AppointmentsService) {}

  @Post()
  async create(@Req() req: AuthRequest, @Body() dto: any) {
    if (!req.user || req.user.role !== 'PATIENT') {
      throw new ForbiddenException('Только пациент может записываться')
    }

    return this.appointments.create(req.user.sub, dto)
  }
}
