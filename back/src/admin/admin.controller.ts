import { Controller, Post, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { CreateCabinetDto } from './dto/create-cabinet.dto';
import { Roles } from '../auth/roles.decorator';

@Controller('admin')
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Roles('ADMIN')
  @Post('create-doctor')
  createDoctor(@Body() dto: CreateDoctorDto) {
    return this.service.createDoctor(dto.user, dto.doctor);
  }

  @Roles('ADMIN')
  @Post('cabinets')
  createCabinet(@Body() dto: CreateCabinetDto) {
    return this.service.createCabinet(dto);
  }
}
