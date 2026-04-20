import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class AccessLoggerMiddleware implements NestMiddleware {
  use(req, res, next) {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;

      console.log(
        `[ACCESS] ${new Date().toISOString()}
User: ${req.user ? req.user.sub + ' (' + req.user.role + ')' : 'GUEST'}
Method: ${req.method}
Path: ${req.originalUrl}
Status: ${res.statusCode}
Time: ${duration}ms`,
      );
    });

    next();
  }
}
