import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DoctorsModule } from './doctors/doctors.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AccessLoggerMiddleware } from './auth/middleware/access-logger.middleware';
import { CombinedAuthGuard } from './auth/guards/combined-auth.guard';
import { DatabaseInitService } from './database-init/database-init.service';

@Module({
  imports: [PrismaModule, RedisModule, AuthModule, UsersModule, DoctorsModule],
  controllers: [AppController],
  providers: [
    AppService,
    CombinedAuthGuard, // ← ОБЯЗАТЕЛЬНО
    DatabaseInitService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AccessLoggerMiddleware).forRoutes('*');
  }
}
