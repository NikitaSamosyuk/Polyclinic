// src/main.ts
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { RolesGuard } from './auth/roles.guard';

async function bootstrap() {
  dotenv.config(); // локально; в Docker можно оставить — не мешает

  const app = await NestFactory.create(AppModule);

  // Валидация DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Глобальный RolesGuard
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new RolesGuard(reflector));

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
