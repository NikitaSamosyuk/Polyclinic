import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AccessMap } from '../../auth/access.map';
import { match } from 'path-to-regexp';

@Injectable()
export class CombinedAuthGuard implements CanActivate {
  private jwtGuard = new (AuthGuard('jwt'))();

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const routePath = req.route?.path;
    const requestPath = req.path || req.url || '';

    // Ищем правило в AccessMap
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

    // Публичный маршрут
    if (rule === 'PUBLIC') return true;

    // Проверяем JWT
    const can = await this.jwtGuard.canActivate(context);
    if (!can) return false;

    // После успешного JWT Guard Nest сам положит payload в req.user
    const user = req.user;
    if (!user) return false;

    // Если нет правила запрещаем
    if (!rule) return false;

    // Проверяем роль
    if (Array.isArray(rule)) {
      return rule.includes(user.role);
    }

    return false;
  }
}
