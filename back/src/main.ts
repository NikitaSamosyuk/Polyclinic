import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as cookieParser from 'cookie-parser';
import { CombinedAuthGuard } from './auth/guards/combined-auth.guard';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  // 🔥 ПРАВИЛЬНАЯ раздача статики
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const reflector = app.get(Reflector);
  app.useGlobalGuards(new CombinedAuthGuard(reflector));

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');

  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
