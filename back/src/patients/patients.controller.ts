import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Req,
  Param,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { RegisterPatientDto } from './dto/register-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patients: PatientsService) {}

  // ============================================================
  // РЕГИСТРАЦИЯ ПАЦИЕНТА
  // ============================================================

  @Post('register')
  async register(@Req() req, @Body() dto: RegisterPatientDto) {
    if (req.user.role !== 'PATIENT') {
      throw new ForbiddenException(
        'Only patients can register patient profile',
      );
    }

    return this.patients.createPatient(req.user.sub, dto);
  }

  // ============================================================
  // МОЙ ПРОФИЛЬ
  // ============================================================

  @Get('me')
  async me(@Req() req) {
    if (req.user.role !== 'PATIENT') {
      throw new ForbiddenException('Only patients can access this endpoint');
    }

    return this.patients.getByUserId(req.user.sub);
  }

  // ============================================================
  // ПОИСК
  // ============================================================

  @Get('search/query')
  async search(@Req() req, @Query('q') q: string) {
    if (!q) return [];
    return this.patients.search(q, req.user.sub, req.user.role);
  }

  // ============================================================
  // СПИСОК ПАЦИЕНТОВ
  // ============================================================

  @Get()
  async getAll(@Req() req) {
    return this.patients.getAllForDoctorOrAdmin(req.user.sub, req.user.role);
  }

  // ============================================================
  // ПОЛУЧЕНИЕ ПАЦИЕНТА
  // ============================================================

  @Get(':id')
  async getById(@Req() req, @Param('id') id: string) {
    return this.patients.getByIdForDoctorOrAdmin(
      Number(id),
      req.user.sub,
      req.user.role,
    );
  }

  // ============================================================
  // ОБНОВЛЕНИЕ ПАЦИЕНТА
  // ============================================================

  @Patch(':id')
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdatePatientDto,
  ) {
    return this.patients.updatePatient(
      Number(id),
      req.user.sub,
      req.user.role,
      dto,
    );
  }

  // ============================================================
  // ДЕАКТИВАЦИЯ ПАЦИЕНТА
  // ============================================================

  @Patch(':id/deactivate')
  async deactivate(@Req() req, @Param('id') id: string) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admin can deactivate patients');
    }

    return this.patients.deactivatePatient(Number(id));
  }

  // ============================================================
  // АКТИВАЦИЯ ПАЦИЕНТА
  // ============================================================

  @Patch(':id/activate')
  async activate(@Req() req, @Param('id') id: string) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admin can activate patients');
    }

    return this.patients.activatePatient(Number(id));
  }
}
