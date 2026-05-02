import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { VisitsService } from './visits.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { Request } from 'express';

type Role = 'ADMIN' | 'DOCTOR' | 'PATIENT';

interface AuthUser {
  sub: number;
  role: Role;
}

interface AuthRequest extends Request {
  user?: AuthUser;
}

@Controller('visits')
export class VisitsController {
  constructor(private readonly visits: VisitsService) {}

  @Post()
  create(@Req() req: AuthRequest, @Body() dto: CreateVisitDto) {
    return this.visits.create(req.user!.sub, req.user!.role, dto);
  }

  @Get()
  getAll(@Req() req: AuthRequest) {
    return this.visits.getAll(req.user!.sub, req.user!.role);
  }

  @Get('my')
  getMy(@Req() req: AuthRequest) {
    return this.visits.getMy(req.user!.sub, req.user!.role);
  }

  @Get(':id')
  getById(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.visits.getById(Number(id), req.user!.sub, req.user!.role);
  }

  @Patch(':id')
  update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdateVisitDto,
  ) {
    return this.visits.update(Number(id), req.user!.sub, req.user!.role, dto);
  }

  @Delete(':id')
  delete(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.visits.delete(Number(id), req.user!.sub, req.user!.role);
  }
}
