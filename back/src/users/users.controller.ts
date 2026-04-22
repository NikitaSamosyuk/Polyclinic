// src/users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
  Req,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersService } from './users.service';
import { CombinedAuthGuard } from '../auth/guards/combined-auth.guard'; // проверь путь

@Controller('users')
@UseGuards(CombinedAuthGuard)
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('avatar')
  async getAvatar(@Req() req) {
    const user = await this.users.getById(req.user.sub);
    return { avatarUrl: user.avatarUrl || '/uploads/defaults/user.png' };
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

  @Patch()
  async updateProfile(
    @Req() req,
    @Body() dto: { username?: string; email?: string },
  ) {
    const userId = req.user.sub;
    return this.users.update(userId, dto);
  }

  @Patch('password')
  async changePassword(
    @Req() req,
    @Body() dto: { currentPassword: string; newPassword: string },
  ) {
    const userId = req.user.sub;
    await this.users.changePassword(
      userId,
      dto.currentPassword,
      dto.newPassword,
    );
    return { success: true };
  }
}
