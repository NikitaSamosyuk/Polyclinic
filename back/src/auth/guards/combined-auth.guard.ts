import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AccessMap } from '../../auth/access.map';
import { match } from 'path-to-regexp';
import { Reflector } from '@nestjs/core';

@Injectable()
export class CombinedAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const method: string = req.method;
    // безопасно получаем путь маршрута; если нет — используем req.path
    const routePath: string | undefined = req.route?.path;
    const requestPath: string = req.path || req.url || '';

    const key = routePath ? `${method} ${routePath}` : undefined;
    let rule = key ? AccessMap[key] : undefined;

    if (!rule) {
      for (const mapKey of Object.keys(AccessMap)) {
        const [mapMethod, mapPath] = mapKey.split(' ');
        if (mapMethod !== method) continue;

        const matcher = match(mapPath, { decode: decodeURIComponent });
        if (matcher(requestPath)) {
          rule = AccessMap[mapKey];
          break;
        }
      }
    }

    if (rule === 'PUBLIC') return true;

    // Проверяем JWT (AuthGuard('jwt')) — если не авторизован, возвращаем false
    const jwtGuard = new (AuthGuard('jwt'))();
    const can = await jwtGuard.canActivate(context);
    if (typeof can === 'boolean' && !can) return false;

    // После успешной проверки JWT ожидаем, что req.user установлен
    const user = req.user;
    if (!user) return false;

    if (!rule) return false;

    if (Array.isArray(rule)) {
      return rule.includes(user.role);
    }

    return false;
  }
}
