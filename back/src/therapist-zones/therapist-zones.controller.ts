import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { TherapistZonesService } from './therapist-zones.service';
import { CreateTherapistZoneDto } from './dto/create-zone.dto';
import { UpdateTherapistZoneDto } from './dto/update-zone.dto';

@Controller('therapist-zones')
export class TherapistZonesController {
  constructor(private zones: TherapistZonesService) {}

  @Get()
  async getAll() {
    return this.zones.getAll();
  }

  @Get('doctor/:doctorId')
  async getByDoctor(@Param('doctorId') doctorId: string) {
    return this.zones.getByDoctor(Number(doctorId));
  }

  @Post()
  async create(@Req() req, @Body() dto: CreateTherapistZoneDto) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admin can create zones');
    }

    return this.zones.create(dto);
  }

  @Patch(':id')
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateTherapistZoneDto,
  ) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admin can update zones');
    }

    return this.zones.update(Number(id), dto);
  }

  @Delete(':id')
  async delete(@Req() req, @Param('id') id: string) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admin can delete zones');
    }

    return this.zones.delete(Number(id));
  }
}
