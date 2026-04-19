import { Controller, Get, Req } from '@nestjs/common';
import { PatientsService } from './patients.service';

@Controller('patients')
export class PatientsController {
  constructor(private patients: PatientsService) {}

  @Get('me')
  async me(@Req() req) {
    return this.patients.getByUserId(req.user.sub);
  }
}
