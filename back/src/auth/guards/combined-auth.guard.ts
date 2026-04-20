import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AccessMap } from '../access.map';
import { match } from 'path-to-regexp';
import { Reflector } from '@nestjs/core';

@Injectable()
export class CombinedAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const method = req.method;
    const path = req.route.path;

    const key = `${method} ${path}`;
    let rule = AccessMap[key];

    if (!rule) {
      for (const mapKey of Object.keys(AccessMap)) {
        const [mapMethod, mapPath] = mapKey.split(' ');
        if (mapMethod !== method) continue;

        const matcher = match(mapPath, { decode: decodeURIComponent });
        if (matcher(req.path)) {
          rule = AccessMap[mapKey];
          break;
        }
      }
    }

    if (rule === 'PUBLIC') return true;

    const jwtGuard = new (AuthGuard('jwt'))();
    const can = await jwtGuard.canActivate(context);
    if (typeof can === 'boolean' && !can) return false;

    if (!rule) return false;

    if (Array.isArray(rule)) {
      return rule.includes(req.user.role);
    }

    return false;
  }
}
