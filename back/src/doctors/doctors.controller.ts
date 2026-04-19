import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { DoctorsService } from './doctors.service';
import { extname } from 'path';

@Controller('doctors')
export class DoctorsController {
  constructor(private doctors: DoctorsService) {}

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
  async uploadPhoto(@UploadedFile() file, @Req() req) {
    const url = `/uploads/doctors/${file.filename}`;

    await this.doctors.updatePhoto(req.user.sub, url);

    return { photoUrl: url };
  }
}
