import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UsersService } from './users.service';
import { extname } from 'path';

@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('avatar')
  async getAvatar(@Req() req) {
    const user = await this.users.getById(req.user.sub);

    return {
      avatarUrl: user.avatarUrl || '/uploads/defaults/user.png',
    };
  }

  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const ext = extname(file.originalname);
          cb(null, `user_${req.user.sub}${ext}`);
        },
      }),
    }),
  )
  async uploadAvatar(@UploadedFile() file, @Req() req) {
    const url = `/uploads/avatars/${file.filename}`;

    await this.users.updateAvatar(req.user.sub, url);

    return { avatarUrl: url };
  }
}
