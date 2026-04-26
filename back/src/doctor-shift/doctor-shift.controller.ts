import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { DoctorShiftService, ShiftWithRelations } from './doctor-shift.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { Request } from 'express';

interface AuthRequest extends Request {
  user?: {
    sub: number;
    role: 'ADMIN' | 'DOCTOR' | 'PATIENT';
    iat?: number;
    exp?: number;
  };
}

@Controller('shifts')
export class DoctorShiftController {
  constructor(private readonly shifts: DoctorShiftService) {}

  @Get()
  async getMany(
    @Query('doctorId') doctorId?: string,
    @Query('cabinetId') cabinetId?: string,
    @Query('date') date?: string,
  ): Promise<ShiftWithRelations[]> {
    return this.shifts.getMany({
      doctorId: doctorId ? Number(doctorId) : undefined,
      cabinetId: cabinetId ? Number(cabinetId) : undefined,
      date,
    });
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<ShiftWithRelations> {
    return this.shifts.getById(Number(id));
  }

  @Post()
  async create(
    @Req() req: AuthRequest,
    @Body() dto: CreateShiftDto,
  ): Promise<ShiftWithRelations> {
    if (!req.user || req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Недостаточно прав для создания смены');
    }

    return this.shifts.create(dto);
  }

  @Patch(':id')
  async update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdateShiftDto,
  ): Promise<ShiftWithRelations> {
    if (!req.user || req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Недостаточно прав для изменения смены');
    }

    return this.shifts.update(Number(id), dto);
  }

  @Delete(':id')
  async delete(
    @Req() req: AuthRequest,
    @Param('id') id: string,
  ): Promise<ShiftWithRelations> {
    if (!req.user || req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Недостаточно прав для удаления смены');
    }

    return this.shifts.delete(Number(id));
  }
}
