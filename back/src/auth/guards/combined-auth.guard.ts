import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class CombinedAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );

    if (isPublic) return true;

    const jwtGuard = new (AuthGuard('jwt'))();

    const can = await jwtGuard.canActivate(context);
    if (typeof can === 'boolean') return can;

    return (can as any).toPromise?.() ?? true;
  }
}
