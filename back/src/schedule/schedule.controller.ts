import { Controller, Get, Query, Req } from '@nestjs/common'
import { ScheduleService } from './schedule.service'
import { GetSlotsDto } from './dto/get-slots.dto'
import { Request } from 'express'

interface AuthRequest extends Request {
  user?: {
    sub: number
    role: 'ADMIN' | 'DOCTOR' | 'PATIENT'
    iat?: number
    exp?: number
  }
}

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly schedule: ScheduleService) {}

  @Get('doctor')
  async doctorSlots(@Query() query: GetSlotsDto) {
    return this.schedule.getSlotsForDoctor(query.doctorId, query.date)
  }

  @Get('therapist/nearest')
  async nearestTherapistSlot(@Req() req: AuthRequest) {
    if (!req.user) {
      throw new Error('Unauthorized')
    }

    return this.schedule.getNearestSlotForTherapist(req.user.sub)
  }

  @Get('therapists')
  async therapistsSlots(@Query('date') date: string) {
    return this.schedule.getSlotsForAnyTherapist(date)
  }
}
