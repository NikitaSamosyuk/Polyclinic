import { Controller, Get, Req } from '@nestjs/common';
import { PatientsService } from './patients.service';

@Controller('patients')
export class PatientsController {
  constructor(private readonly service: PatientsService) {}

  @Get('profile')
  getProfile(@Req() req) {
    return this.service.getProfile(req.user.id);
  }

  @Get('appointments')
  getAppointments(@Req() req) {
    return this.service.getAppointments(req.user.id);
  }

  @Get('visits')
  getVisits(@Req() req) {
    return this.service.getVisits(req.user.id);
  }
}
