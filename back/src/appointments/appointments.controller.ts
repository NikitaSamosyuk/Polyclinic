import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Patch,
  Delete,
  Param,
  Req,
  Post,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { Request } from 'express';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

interface AuthRequest extends Request {
  user?: {
    sub: number;
    role: 'ADMIN' | 'DOCTOR' | 'PATIENT';
  };
}

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointments: AppointmentsService) {}

  @Post()
  async create(@Req() req: AuthRequest, @Body() dto: CreateAppointmentDto) {
    if (!req.user || req.user.role !== 'PATIENT') {
      throw new ForbiddenException('Только пациент может записываться');
    }

    return this.appointments.create(req.user.sub, dto);
  }

  @Get('all')
  async getAll(@Req() req: AuthRequest) {
    if (!req.user || req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Только админ может видеть все записи');
    }

    return this.appointments.getAll();
  }

  @Get('my')
  async getMy(@Req() req: AuthRequest) {
    if (!req.user) {
      throw new ForbiddenException('Не авторизован');
    }

    return this.appointments.getMy(req.user.sub, req.user.role);
  }

  @Get('doctor/:doctorId')
  async getByDoctor(
    @Req() req: AuthRequest,
    @Param('doctorId') doctorId: string,
  ) {
    if (!req.user || req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Только админ может видеть записи врача');
    }

    return this.appointments.getByDoctorId(Number(doctorId));
  }

  @Delete('my/:id')
  async cancelMy(@Req() req: AuthRequest, @Param('id') id: string) {
    if (!req.user || req.user.role !== 'PATIENT') {
      throw new ForbiddenException('Только пациент может отменять свои записи');
    }

    return this.appointments.cancelMy(req.user.sub, parseInt(id, 10));
  }

  @Patch(':id')
  async update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
  ) {
    if (!req.user || req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Только админ может редактировать записи');
    }

    return this.appointments.update(parseInt(id, 10), dto);
  }

  @Delete(':id')
  async delete(@Req() req: AuthRequest, @Param('id') id: string) {
    if (!req.user || req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Только админ может удалять записи');
    }

    return this.appointments.delete(parseInt(id, 10));
  }
}
