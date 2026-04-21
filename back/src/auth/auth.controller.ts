import { Controller, Post, Body, Res, Req, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private users: UsersService,
  ) {}

  @Post('register')
  async register(@Body() dto, @Res({ passthrough: true }) res) {
    const tokens = await this.auth.register(dto);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });

    return { accessToken: tokens.accessToken };
  }

  @Post('login')
  async login(@Body() dto, @Res({ passthrough: true }) res) {
    const tokens = await this.auth.login(dto);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });

    return { accessToken: tokens.accessToken };
  }

  @Post('refresh')
  async refresh(@Req() req, @Res({ passthrough: true }) res) {
    const token = req.cookies?.refreshToken;
    if (!token) return { accessToken: null };

    const payload = await this.auth.verifyRefreshToken(token);
    const tokens = await this.auth.refresh(payload.sub, token);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });

    return { accessToken: tokens.accessToken };
  }

  @Get('me')
  async me(@Req() req) {
    // CombinedAuthGuard уже проверил токен и положил payload в req.user
    const user = await this.users.getById(req.user.sub);

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      avatarUrl: user.avatarUrl,
    };
  }

  @Post('logout')
  async logout(@Req() req, @Res({ passthrough: true }) res) {
    await this.auth.logout(req.user.sub);

    res.clearCookie('refreshToken', {
      path: '/',
    });

    return { success: true };
  }
}
