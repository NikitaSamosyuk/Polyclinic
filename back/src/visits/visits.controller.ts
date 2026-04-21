import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { VisitsService } from './visits.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';

@Controller('visits')
export class VisitsController {
  constructor(private visits: VisitsService) {}

  @Post()
  async create(@Req() req, @Body() dto: CreateVisitDto) {
    if (req.user.role !== 'DOCTOR') {
      throw new ForbiddenException('Only doctors can create visits');
    }

    return this.visits.create(req.user.sub, dto);
  }

  @Patch(':id')
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateVisitDto,
  ) {
    if (req.user.role !== 'DOCTOR') {
      throw new ForbiddenException('Only doctors can update visits');
    }

    return this.visits.update(req.user.sub, Number(id), dto);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.visits.getById(Number(id));
  }

  @Get()
  async getForUser(@Req() req) {
    if (req.user.role === 'PATIENT') {
      return this.visits.getForPatient(req.user.sub);
    }

    if (req.user.role === 'DOCTOR') {
      return this.visits.getForDoctor(req.user.sub);
    }

    throw new ForbiddenException('Access denied');
  }
}
