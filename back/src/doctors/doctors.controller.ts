import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  Req,
  Body,
  ForbiddenException,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { DoctorsService } from './doctors.service';
import { extname } from 'path';

@Controller('doctors')
export class DoctorsController {
  constructor(private doctors: DoctorsService) {}

  @Get()
  async getAllDoctors() {
    const doctors = await this.doctors.getAll();

    return doctors.map((d) => ({
      id: d.id,
      userId: d.userId,

      firstName: d.firstName,
      lastName: d.lastName,
      middleName: d.middleName,
      specialization: d.specialization,
      isTherapist: d.isTherapist,

      cabinetId: d.cabinetId,
      cabinetNumber: d.cabinet?.number || null,

      photoUrl: d.photoUrl || '/uploads/defaults/doctor.png',
    }));
  }

  @Get('user/:userId')
  async getByUserId(@Param('userId') userId: string) {
    return this.doctors.getByUserId(Number(userId));
  }

  @Get('photo')
  async getPhoto(@Req() req) {
    const doctor = await this.doctors.getByUserId(req.user.sub);

    return {
      photoUrl: doctor.photoUrl || '/uploads/defaults/doctor.png',
    };
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
}
