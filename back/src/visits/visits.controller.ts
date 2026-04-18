import {
  Controller,
  Post,
  Body,
  Param,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { VisitsService } from './visits.service';

@Controller('visits')
export class VisitsController {
  constructor(private readonly service: VisitsService) {}

  @Post()
  create(@Body() dto: any) {
    return this.service.create(dto);
  }

  @Post(':id/files')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const visitId = req.params.id;
          cb(null, `uploads/visits/${visitId}`);
        },
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  uploadFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: any,
  ) {
    return this.service.attachFile(Number(id), {
      filePath: file.path,
      fileType: file.mimetype,
      description: dto.description,
    });
  }
}
