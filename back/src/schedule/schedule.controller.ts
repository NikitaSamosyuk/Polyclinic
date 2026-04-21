import { Controller, Get, Query, Req } from '@nestjs/common';
import { ScheduleService } from './schedule.service';

@Controller('schedule')
export class ScheduleController {
  constructor(private schedule: ScheduleService) {}

  // --- Слоты врача ---
  @Get('doctor')
  async doctorSlots(
    @Query('doctorId') doctorId: string,
    @Query('date') date: string,
  ) {
    return this.schedule.getSlotsForDoctor(Number(doctorId), date);
  }

  // --- Слоты участкового ---
  @Get('therapist/nearest')
  async nearestTherapistSlot(@Req() req) {
    return this.schedule.getNearestSlotForTherapist(req.user.sub);
  }

  // --- Слоты всех терапевтов на дату ---
  @Get('therapists')
  async therapistsSlots(@Query('date') date: string) {
    return this.schedule.getSlotsForAnyTherapist(date);
  }
}
