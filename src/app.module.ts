import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { RedisModule } from './database/redis.module';
import { UserModule } from './features/user/user.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AuthModule } from './features/auth/auth.module';
import { ProfileModule } from './features/profile/profile.module';
import { AdminModule } from './features/admin/admin.module';
import { BlacklistModule } from './features/blacklist/blacklist.module';
import { WhiteListModule } from './features/whitelist/whitelist.module';
import { PhoneModule } from './features/phone/phone.module';
import { ReportModule } from './features/report/report.module';
import { AppealModule } from './features/appeal/appeal.module';
import { ActionLogModule } from './features/action-log/action-log.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        // 1 минута - 300 запросов
        ttl: 60000,
        limit: 300,
      },
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    DatabaseModule,
    RedisModule,
    UserModule,
    AuthModule,
    ProfileModule,
    AdminModule,
    WhiteListModule,
    BlacklistModule,
    PhoneModule,
    ReportModule,
    AppealModule,
    ActionLogModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
