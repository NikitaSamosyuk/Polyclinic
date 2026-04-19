import { Controller, Post, Body, Res, Req, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() dto, @Res({ passthrough: true }) res) {
    const tokens = await this.auth.register(dto);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/', // ✔ фикс
    });

    return { accessToken: tokens.accessToken };
  }

  @Public()
  @Post('login')
  async login(@Body() dto, @Res({ passthrough: true }) res) {
    const tokens = await this.auth.login(dto);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/', // ✔ фикс
    });

    return { accessToken: tokens.accessToken };
  }

  @Public()
  @Post('refresh')
  async refresh(@Req() req, @Res({ passthrough: true }) res) {
    const token = req.cookies?.refreshToken;
    if (!token) return { accessToken: null };

    const payload = await this.auth.verifyRefreshToken(token);
    const tokens = await this.auth.refresh(payload.sub, token);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/', // ✔ фикс
    });

    return { accessToken: tokens.accessToken };
  }

  @Get('me')
  async me(@Req() req) {
    return req.user;
  }

  @Post('logout')
  async logout(@Req() req, @Res({ passthrough: true }) res) {
    await this.auth.logout(req.user.sub);

    res.clearCookie('refreshToken', {
      path: '/', // ✔ фикс
    });

    return { success: true };
  }
}
