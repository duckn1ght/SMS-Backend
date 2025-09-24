import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../types/jwtPayload.type';
import { CLIENT_TYPE } from '../../user/types/user.types';

@Injectable()
export class WebJwtStrategy extends PassportStrategy(Strategy, 'jwt-web') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('WEB_JWT_SECRET_KEY'),
    });
  }

  validate(payload: JwtPayload) {
    if (payload.client_type !== CLIENT_TYPE.WEB)
      throw new UnauthorizedException('Invalid token for web client');
    return { id: payload.id, role: payload.role, name: payload.name };
  }
}
