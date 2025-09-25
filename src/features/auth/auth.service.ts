import { Injectable, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { AuthDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { CLIENT_TYPE, USER_ROLE } from '../user/types/user.types';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './types/jwtPayload.type';
import { RegDto } from './dto/reg.dto';
import { CatchErrors } from 'src/const/check.decorator';
import { ActionLogService } from '../action-log/action-log.service';
import { ACTION_LOG_TYPE } from '../action-log/types/action-log.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRep: Repository<User>,
    private logService: ActionLogService,
  ) {}

  @CatchErrors()
  async auth(dto: AuthDto) {
    let existedUser;
    if (dto.clientType === CLIENT_TYPE.ANDROID) {
      existedUser = await this.userRep.findOne({
        where: { phone: dto.phone },
      });
    } else {
      existedUser = await this.userRep.findOne({
        where: { email: dto.email },
      });
    }

    if (existedUser) {
      const isMatch = await bcrypt.compare(dto.password, existedUser.password);
      if (isMatch) {
        await this.logService.createLog(
          {
            message: `Пользователь ${existedUser.name} авторизовался`,
            type: ACTION_LOG_TYPE.INFO,
          },
          existedUser.id,
        );
        return await this.#getJwt(existedUser);
      } else {
        return { code: 400, message: 'Неверный пароль' };
      }
    } else {
      return { code: 404, message: 'Данный номер не зарегистрирован' };
    }
  }

  @CatchErrors()
  async registration(dto: RegDto) {
    const existedUser = await this.userRep.findOne({
      where: { phone: dto.phone },
    });
    if (existedUser) return { code: 400, message: 'Данный номер уже зарегистрирован' };
    const newUser = await this.userRep.save({
      name: dto.name,
      phone: dto.phone,
      city: dto.city,
      password: await bcrypt.hash(dto.password, 10),
      role: USER_ROLE.USER,
      clientType: CLIENT_TYPE.ANDROID,
    });
    await this.logService.createLog(
      {
        message: `Пользователь ${newUser.name} зарегистрировался`,
        type: ACTION_LOG_TYPE.INFO,
      },
      newUser.id,
    );
    return await this.#getJwt(newUser);
  }

  @CatchErrors()
  async me(id: string) {
    return await this.userRep.findOne({ where: { id: id } });
  }

  /** Получение JWT токена для указанного User. */
  async #getJwt(user: User) {
    const payload: JwtPayload = {
      id: user.id,
      name: user.name || '',
      role: user.role,
      client_type: user.clientType,
    };

    const { secret, expiresIn } = this.#getJwtConfig(user.clientType);

    return await this.jwtService.sign(payload, { secret, expiresIn });
  }

  #getJwtConfig(clientType: CLIENT_TYPE) {
    switch (clientType) {
      case CLIENT_TYPE.WEB:
        return {
          secret: process.env.WEB_JWT_SECRET_KEY,
          expiresIn: process.env.WEB_JWT_EXPIRES_IN || '12h',
        };
      case CLIENT_TYPE.ANDROID:
        return {
          secret: process.env.ANDROID_JWT_SECRET_KEY,
          expiresIn: process.env.ANDROID_JWT_EXPIRES_IN || '30d',
        };
    }
  }
}
