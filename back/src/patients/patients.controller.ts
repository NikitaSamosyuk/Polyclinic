import {
  Controller,
  Get,
  Req,
  ForbiddenException,
  Param,
} from '@nestjs/common';
import { PatientsService } from './patients.service';

@Controller('patients')
export class PatientsController {
  constructor(private patients: PatientsService) {}

  // --- Профиль текущего пациента ---
  @Get('me')
  async me(@Req() req) {
    if (req.user.role !== 'PATIENT') {
      throw new ForbiddenException('Only patients can access this endpoint');
    }

    return this.patients.getByUserId(req.user.sub);
  }

  // --- Профиль пациента по userId (для PatientProfile.vue) ---
  @Get('user/:userId')
  async getByUserId(@Param('userId') userId: string) {
    return this.patients.getByUserId(Number(userId));
  }

  // --- Список всех пациентов (для врача и админа) ---
  @Get()
  async getAll(@Req() req) {
    if (req.user.role !== 'DOCTOR' && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only doctors and admins can view patients');
    }

    return this.patients.getAll();
  }
}
