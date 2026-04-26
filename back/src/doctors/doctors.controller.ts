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
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request } from 'express';

interface AuthRequest extends Request {
  user: {
    sub: number;
    role: 'ADMIN' | 'DOCTOR' | 'PATIENT';
  };
}

@Controller('doctors')
export class DoctorsController {
  constructor(private doctors: DoctorsService) {}

  @Get()
  async getAll() {
    return this.doctors.getAllActive();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.doctors.getById(Number(id));
  }

  @Get('user/:userId')
  async getByUserId(@Param('userId') userId: string) {
    return this.doctors.getByUserId(Number(userId));
  }

  @Get('photo')
  async getPhoto(@Req() req: AuthRequest) {
    const doctor = await this.doctors.getByUserId(req.user.sub);
    return { photoUrl: doctor.photoUrl };
  }

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
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthRequest,
    @Body('userId') userId?: number,
  ) {
    const actor = req.user;

    if (actor.role === 'DOCTOR') {
      userId = actor.sub;
    }

    if (actor.role === 'ADMIN' && !userId) {
      throw new ForbiddenException('userId is required for admin');
    }

    const url = `/uploads/doctors/${file.filename}`;
    const updated = await this.doctors.updatePhoto(userId!, url);

    return { photoUrl: updated.photoUrl };
  }

  @Post()
  async createDoctor(@Req() req: AuthRequest, @Body() dto: CreateDoctorDto) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admin can create doctors');
    }

    return this.doctors.createDoctor(dto);
  }

  @Patch(':id')
  async updateDoctor(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdateDoctorDto,
  ) {
    const actor = req.user;

    return this.doctors.updateDoctor(Number(id), dto, actor.role, actor.sub);
  }

  @Delete(':id')
  async deactivateDoctor(@Req() req: AuthRequest, @Param('id') id: string) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admin can deactivate doctors');
    }

    return this.doctors.deactivateDoctor(Number(id));
  }

  @Get(':id/patients')
  async getDoctorPatients(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.doctors.getDoctorPatients(
      Number(id),
      req.user.sub,
      req.user.role,
    );
  }

  @Get(':id/zones')
  async getDoctorZones(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.doctors.getDoctorZones(Number(id), req.user.sub, req.user.role);
  }
}
