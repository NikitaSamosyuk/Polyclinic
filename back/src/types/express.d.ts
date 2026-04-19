import 'express';

declare module 'express' {
  interface Request {
    user?: {
      sub: number;
      role: string;
      iat?: number;
      exp?: number;
    };
  }
}
