import {
  Controller,
  Post,
  Get,
  Req,
  Body,
  ForbiddenException,
  Param,
  Delete,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentSlotDto } from './dto/create-appointment-slot.dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(private appointments: AppointmentsService) {}

  // --- Создать запись (только пациент) ---
  @Post('slot')
  async createFromSlot(@Req() req, @Body() dto: CreateAppointmentSlotDto) {
    if (req.user.role !== 'PATIENT') {
      throw new ForbiddenException('Only patients can create appointments');
    }

    return this.appointments.createFromSlot(req.user.sub, dto);
  }

  // --- Мои записи (пациент / врач) ---
  @Get()
  async getForUser(@Req() req) {
    return this.appointments.getForUser(req.user.sub, req.user.role);
  }

  // --- Все записи врача (только админ) ---
  @Get('doctor/:doctorId')
  async getForDoctor(@Req() req, @Param('doctorId') doctorId: string) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admin can view doctor appointments');
    }

    return this.appointments.getForDoctor(Number(doctorId));
  }

  // --- Все записи (только админ) ---
  @Get('all')
  async getAll(@Req() req) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admin can view all appointments');
    }

    return this.appointments.getAll();
  }

  // --- Удалить запись (только админ) ---
  @Delete(':id')
  async delete(@Req() req, @Param('id') id: string) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admin can delete appointments');
    }

    return this.appointments.delete(Number(id));
  }
}
