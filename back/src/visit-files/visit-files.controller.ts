import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { VisitFilesService } from './visit-files.service';
import { extname } from 'path';

@Controller('visit-files')
export class VisitFilesController {
  constructor(private files: VisitFilesService) {}

  @Post(':visitId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/visits',
        filename: (req, file, cb) => {
          const ext = extname(file.originalname);
          cb(null, `visit_${Date.now()}${ext}`);
        },
      }),
    }),
  )
  async upload(
    @Req() req,
    @Param('visitId') visitId: string,
    @UploadedFile() file,
    @Body('description') description?: string,
  ) {
    if (req.user.role !== 'DOCTOR') {
      throw new ForbiddenException('Only doctors can upload visit files');
    }

    return this.files.upload(Number(visitId), file, description);
  }

  @Get(':visitId')
  async getFiles(@Param('visitId') visitId: string) {
    return this.files.getFiles(Number(visitId));
  }

  @Delete('file/:id')
  async delete(@Req() req, @Param('id') id: string) {
    if (req.user.role !== 'DOCTOR' && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Access denied');
    }

    return this.files.delete(Number(id));
  }
}
