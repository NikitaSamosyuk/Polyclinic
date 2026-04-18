import { Controller, Get, Param, Req } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { Public } from '../auth/public.decorator';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly service: DoctorsService) {}

  @Public()
  @Get()
  getAllDoctors() {
    return this.service.getAllDoctors();
  }

  @Public()
  @Get(':id/schedule')
  getSchedule(@Param('id') id: string) {
    return this.service.getSchedule(Number(id));
  }

  @Get('profile')
  getProfile(@Req() req) {
    return this.service.getProfile(req.user.id);
  }
}
