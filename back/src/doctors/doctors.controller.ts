// src/doctors/doctors.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  ForbiddenException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('doctors')
export class DoctorsController {
  constructor(private doctors: DoctorsService) {}

  // --- PUBLIC: список врачей ---
  @Get()
  async getAll() {
    return this.doctors.getAllActive();
  }

  // --- PUBLIC: карточка врача ---
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.doctors.getById(Number(id));
  }

  // --- PATIENT/DOCTOR/ADMIN: врач по userId ---
  @Get('user/:userId')
  async getByUserId(@Param('userId') userId: string) {
    return this.doctors.getByUserId(Number(userId));
  }

  // --- DOCTOR: получить своё фото ---
  @Get('photo')
  async getPhoto(@Req() req) {
    const doctor = await this.doctors.getByUserId(req.user.sub);
    return {
      photoUrl: doctor.photoUrl || '/uploads/defaults/doctor.png',
    };
  }

  // --- DOCTOR/ADMIN: загрузить фото ---
  @Post('photo')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads/doctors',
        filename: (req, file, cb) => {
          const ext = extname(file.originalname);
          cb(null, `doctor_${req.user.sub}${ext}`);
        },
      }),
    }),
  )
  async uploadPhoto(
    @UploadedFile() file,
    @Req() req,
    @Body('userId') userId?: number,
  ) {
    const actor = req.user;

    if (actor.role === 'DOCTOR') {
      userId = actor.sub;
    }

    if (actor.role === 'ADMIN') {
      if (!userId) throw new ForbiddenException('userId is required for admin');
    }

    const url = `/uploads/doctors/${file.filename}`;
    await this.doctors.updatePhoto(userId, url);

    return { photoUrl: url };
  }

  // --- ADMIN: создать врача ---
  @Post()
  async createDoctor(@Req() req, @Body() dto) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admin can create doctors');
    }
    return this.doctors.createDoctor(dto);
  }

  // --- ADMIN: обновить врача ---
  @Patch(':id')
  async updateDoctor(@Req() req, @Param('id') id: string, @Body() dto) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admin can update doctors');
    }
    return this.doctors.updateDoctor(Number(id), dto);
  }

  // --- ADMIN: деактивировать врача (soft delete) ---
  @Delete(':id')
  async deactivateDoctor(@Req() req, @Param('id') id: string) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admin can deactivate doctors');
    }
    return this.doctors.deactivateDoctor(Number(id));
  }

  // --- DOCTOR/ADMIN: пациенты врача ---
  @Get(':id/patients')
  async getDoctorPatients(@Req() req, @Param('id') id: string) {
    return this.doctors.getDoctorPatients(
      Number(id),
      req.user.sub,
      req.user.role,
    );
  }

  // --- DOCTOR/ADMIN: зоны терапевта ---
  @Get(':id/zones')
  async getDoctorZones(@Req() req, @Param('id') id: string) {
    return this.doctors.getDoctorZones(Number(id), req.user.sub, req.user.role);
  }
}
