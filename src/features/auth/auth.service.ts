import { HttpException, Injectable } from '@nestjs/common';
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
import { SmsCodeService } from './sms-code.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRep: Repository<User>,
    private logService: ActionLogService,
    private smsCodeService: SmsCodeService,
  ) {}

  @CatchErrors()
  async auth(dto: AuthDto) {
    let existedUser: User | null;
    if (dto.clientType === CLIENT_TYPE.ANDROID) {
      existedUser = await this.userRep.findOne({
        where: { phone: dto.phone },
      });
      if (existedUser && !existedUser.smsConfirmed) throw new HttpException('Номер телефона не подтвержден', 400);
    } else {
      existedUser = await this.userRep.findOne({
        where: { email: dto.email },
      });
    }

    if (existedUser) {
      if (!existedUser.isActive) throw new HttpException('Пользователь заблокирован', 403);
      const isMatch = await bcrypt.compare(dto.password, existedUser.password);
      if (isMatch) {
        if (existedUser.firebaseToken !== dto.firebaseToken) {
          await this.userRep.update(existedUser.id, {
            firebaseToken: dto.firebaseToken,
          });
        }
        await this.logService.createLog(
          {
            message: `Пользователь ${existedUser.name} авторизовался`,
            type: ACTION_LOG_TYPE.INFO,
          },
          existedUser.id,
        );
        return this.#getJwt(existedUser);
      } else {
        throw new HttpException('Неверный пароль', 400);
      }
    } else {
      throw new HttpException('Данный номер не зарегистрирован', 404);
    }
  }

  @CatchErrors()
  async registration(dto: RegDto) {
    const existedUser = await this.userRep.findOne({
      where: { phone: dto.phone },
    });
    if (existedUser) throw new HttpException('Данный номер уже зарегистрирован', 400);
    const newUser = await this.userRep.save({
      name: dto.name,
      phone: dto.phone,
      region: dto.region,
      password: await bcrypt.hash(dto.password, 10),
      role: USER_ROLE.USER,
      clientType: CLIENT_TYPE.ANDROID,
      firebaseToken: dto.firebaseToken,
      smsConfirmed: false,
    });
    await this.logService.createLog(
      {
        message: `Пользователь ${newUser.name} зарегистрировался`,
        type: ACTION_LOG_TYPE.INFO,
      },
      newUser.id,
    );
    const code = await this.smsCodeService.generateAndSaveCode(dto.phone);
    await this.smsCodeService.sendSms(newUser.phone, code);
    return {
      message: 'Пользователь успешно зарегистрирован. На указанный номер отправлен код подтверждения',
      statusCode: 201,
    };
  }

  @CatchErrors()
  async confirmSms(phone: string, code: string) {
    const user = await this.userRep.findOne({ where: { phone } });
    if (!user) throw new HttpException('Пользователь не найден', 404);
    const isCodeValid = await this.smsCodeService.verifyCode(phone, code);
    if (!isCodeValid) throw new HttpException('Неверный код', 400);
    if (!user.smsConfirmed) {
      user.smsConfirmed = true;
      await this.userRep.save(user);
      await this.logService.createLog(
        {
          message: `Пользователь ${user.name} подтвердил номер телефона`,
          type: ACTION_LOG_TYPE.INFO,
        },
        user.id,
      );
    }
    return this.#getJwt(user);
  }

  @CatchErrors()
  async me(id: string) {
    return await this.userRep.findOne({ where: { id: id } });
  }

  /** Получение JWT токена для указанного User. */
  #getJwt(user: User) {
    const payload: JwtPayload = {
      id: user.id,
      name: user.name || '',
      role: user.role,
      client_type: user.clientType,
    };

    const { secret, expiresIn } = this.#getJwtConfig(user.clientType);

    return this.jwtService.sign(payload, { secret, expiresIn });
  }

  @CatchErrors()
  async checkReg(phone: string) {
    const phoneReg = await this.userRep.findOne({ where: { phone } });
    return phoneReg ? true : false;
  }

  @CatchErrors()
  async resendSmsCode(phone: string) {
    const user = await this.userRep.findOne({ where: { phone } });
    if (!user) throw new HttpException('Пользователь с таким номером не найден', 404);
    if (user.smsConfirmed) throw new HttpException('Номер телефона уже подтвержден', 400);
    
    const code = await this.smsCodeService.generateAndSaveCode(phone);
    await this.smsCodeService.sendSms(phone, code);
    
    await this.logService.createLog(
      {
        message: `Пользователь ${user.name} запросил переотправку СМС кода`,
        type: ACTION_LOG_TYPE.INFO,
      },
      user.id,
    );
    
    return {
      message: 'Код подтверждения повторно отправлен на указанный номер',
      statusCode: 200,
    };
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
