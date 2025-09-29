import { Catch, HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { CLIENT_TYPE, USER_ROLE } from '../user/types/user.types';
import { USER_SELECT } from 'src/const/selects';
import { CatchErrors } from 'src/const/check.decorator';
import { ActionLogService } from '../action-log/action-log.service';
import { ACTION_LOG_TYPE } from '../action-log/types/action-log.type';
import type { JwtReq } from '../auth/types/jwtReq.type';
import { CreateSmsBanWordDto } from './dto/create-sms-ban-word.dto';
import { SmsBanWord } from '../sms/entities/sms-ban-word.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotificationService } from '../notification/notification.service';
import { BanNotificationText, BanNotificationTitle, UnbanNotificationText, UnbanNotificationTitle } from 'src/const/notifications';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRep: Repository<User>,
    @InjectRepository(SmsBanWord)
    private readonly banWordRepo: Repository<SmsBanWord>,
    private logService: ActionLogService,
    private notificationService: NotificationService,
  ) {}

  @CatchErrors()
  async createUser(dto: CreateUserDto, r: JwtReq) {
    const existedUser = await this.userRep.findOne({
      where: { email: dto.email },
      select: { id: true },
    });
    if (existedUser) throw new HttpException('Этот email уже зарегистрирован', 400);

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const platform = dto.role === USER_ROLE.USER ? CLIENT_TYPE.ANDROID : CLIENT_TYPE.WEB;
    console.log(platform);
    await this.userRep.save({
      email: dto.email,
      name: dto.name,
      password: hashedPassword,
      role: dto.role,
      clientType: platform,
      organization: dto.organization || '',
      position: dto.position || "",
      region: dto.city || ""
    });
    await this.logService.createLog(
      {
        message: `Администратор ${r.user.name} создал нового пользователя: ${dto.name}`,
        type: ACTION_LOG_TYPE.INFO,
      },
      r.user.id,
    );
    return { statusCode: 201, message: 'Новый пользователь успешно создан' };
  }

  @CatchErrors()
  async getUsers(take?: number, skip?: number) {
    const options: any = { select: USER_SELECT };
    if (typeof take === 'number') options.take = take;
    if (typeof skip === 'number') options.skip = skip;
    const [data, total] = await this.userRep.findAndCount(options);
    return {
      data,
      take: take ?? total,
      skip: skip ?? 0,
      total,
    };
  }

  @CatchErrors()
  async getUserById(id: string) {
    return await this.userRep.findOne({ where: { id }, select: USER_SELECT });
  }

  @CatchErrors()
  async updateUser(dto: UpdateUserDto, id: string, r: JwtReq) {
    const existedUser = await this.userRep.findOne({
      where: { id },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!existedUser) throw new HttpException('Пользователь не найден', 404);

    await this.userRep.update(id, dto);
    await this.logService.createLog(
      {
        message: `Администратор ${r.user.name} обновил пользователя: ${existedUser.name}`,
        type: ACTION_LOG_TYPE.INFO,
      },
      r.user.id,
    );
    return { statusCode: 200, message: 'Пользователь успешно обновлен' };
  }

  @CatchErrors()
  async banUser(id: string) {
    const existedUser = await this.userRep.findOne({
      where: { id },
    });
    if (!existedUser) throw new HttpException('Пользователь не найден', 404);
    await this.userRep.update(existedUser.id, {
      isActive: false,
    });
    await this.notificationService.sendPush(existedUser.id, BanNotificationTitle, BanNotificationText);
    return { statusCode: 200, message: 'Пользователь успешно заблокирован' };
  }

  @CatchErrors()
  async unbanUser(id: string) {
    const existedUser = await this.userRep.findOne({
      where: { id },
    });
    if (!existedUser) throw new HttpException('Пользователь не найден', 404);
    await this.userRep.update(existedUser.id, {
      isActive: true,
    });
    await this.notificationService.sendPush(existedUser.id, UnbanNotificationTitle, UnbanNotificationText);
    return { statusCode: 200, message: 'Пользователь успешно разблокирован' };
  }

  @CatchErrors()
  async addBanWord(dto: CreateSmsBanWordDto, r: JwtReq) {
    await this.banWordRepo.save({ word: dto.word });
    await this.logService.createLog(
      {
        message: `Администратор ${r.user.name} добавил новое СМС слово-фильтр: ${dto.word}`,
        type: ACTION_LOG_TYPE.INFO,
      },
      r.user.id,
    );
    return { statusCode: 201, message: 'Бан-слово добавлено' };
  }

  @CatchErrors()
  async getBanWords(take?: number, skip?: number) {
    const options: any = {
      relations: { createdUser: true },
      select: { createdAt: true, id: true, updatedAt: true, word: true, createdUser: USER_SELECT },
    };
    if (typeof take === 'number') options.take = take;
    if (typeof skip === 'number') options.skip = skip;
    const [data, total] = await this.banWordRepo.findAndCount(options);
    return {
      data,
      total,
      take,
      skip,
    };
  }

  @CatchErrors()
  async removeBanWord(id: string, r: JwtReq) {
    const existed = await this.banWordRepo.findOneBy({ id });
    if (!existed) {
      throw new HttpException('Бан-слово с таким ID не найдено', 404);
    }
    await this.banWordRepo.remove(existed);
    await this.logService.createLog(
      {
        message: `Администратор ${r.user.name} удалил слово-фильтр: ${existed.word}`,
        type: ACTION_LOG_TYPE.INFO,
      },
      r.user.id,
    );
    return { statusCode: 204, message: 'Бан-слово удалено' };
  }

  @CatchErrors()
  getLogs(take?: number, skip?: number) {
    return this.logService.get(take, skip);
  }
}
