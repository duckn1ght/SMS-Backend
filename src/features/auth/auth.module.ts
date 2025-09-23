import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { WebJwtStrategy } from './stragegies/web-jwt.strategy';
import { AndroidJwtStrategy } from './stragegies/android-jwt.strategy';
import { ActionLogModule } from '../action-log/action-log.module';

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
  ],
  controllers: [AuthController],
  providers: [AuthService, WebJwtStrategy, AndroidJwtStrategy],
})
export class AuthModule {}
