import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UploadedFile,
  UseInterceptors,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VisitFilesService } from './visit-files.service';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { Request } from 'express';

type Role = 'ADMIN' | 'DOCTOR' | 'PATIENT';

interface AuthUser {
  sub: number;
  role: Role;
}

interface AuthRequest extends Request {
  user?: AuthUser;
}

const ALLOWED_MIME_TYPES: string[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

@Controller('visit-files')
export class VisitFilesController {
  constructor(private readonly files: VisitFilesService) {}

  @Post(':visitId')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 20 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              'Недопустимый тип файла. Разрешены: JPG, PNG, WEBP, PDF, DOC, DOCX',
            ),
            false,
          );
        }
        cb(null, true);
      },
      storage: diskStorage({
        destination: (req, file, cb) => {
          const visitId = (req as AuthRequest).params.visitId;
          const dir = `./uploads/visits/${visitId}`;
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          cb(null, dir);
        },
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}${path.extname(file.originalname)}`);
        },
      }),
    }),
  )
  upload(
    @Req() req: AuthRequest,
    @Param('visitId') visitId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Файл не был загружен');
    }

    return this.files.upload(
      req.user!.sub,
      req.user!.role,
      Number(visitId),
      file,
    );
  }

  @Get(':visitId')
  getByVisit(@Req() req: AuthRequest, @Param('visitId') visitId: string) {
    return this.files.getByVisit(
      req.user!.sub,
      req.user!.role,
      Number(visitId),
    );
  }

  @Delete('file/:fileId')
  delete(@Req() req: AuthRequest, @Param('fileId') fileId: string) {
    return this.files.delete(req.user!.sub, req.user!.role, Number(fileId));
  }
}
