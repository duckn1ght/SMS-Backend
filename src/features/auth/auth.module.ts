import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { WebJwtStrategy } from './stragegies/web-jwt.strategy';
import { AndroidJwtStrategy } from './stragegies/android-jwt.strategy';
import { ActionLogModule } from '../action-log/action-log.module';
import { SmsCodeService } from './sms-code.service';
import { RedisModule } from 'src/database/redis.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.getOrThrow('ANDROID_JWT_SECRET_KEY'),
        signOptions: { expiresIn: configService.getOrThrow('ANDROID_JWT_EXPIRES_IN') },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User]),
    ActionLogModule,
    RedisModule,
    HttpModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, WebJwtStrategy, AndroidJwtStrategy, SmsCodeService],
})
export class AuthModule {}
