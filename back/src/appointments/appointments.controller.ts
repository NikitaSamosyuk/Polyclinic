import { Controller, Post, Body, Req, Delete, Param } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly service: AppointmentsService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateAppointmentDto) {
    return this.service.create(req.user.id, dto);
  }

  @Delete(':id')
  cancel(@Param('id') id: string) {
    return this.service.cancel(Number(id));
  }
}
