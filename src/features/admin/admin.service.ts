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

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRed: Repository<User>,
    @InjectRepository(SmsBanWord)
    private readonly banWordRepo: Repository<SmsBanWord>,
    private logService: ActionLogService,
  ) {}

  @CatchErrors()
  async createUser(dto: CreateUserDto, r: JwtReq) {
    const existedUser = await this.userRed.findOne({
      where: { email: dto.email },
      select: { id: true },
    });
    if (existedUser) throw new HttpException('Этот email уже зарегистрирован', 400);

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const platform = dto.role === USER_ROLE.USER ? CLIENT_TYPE.ANDROID : CLIENT_TYPE.WEB;
    console.log(platform);
    await this.userRed.save({
      email: dto.email,
      name: dto.name,
      password: hashedPassword,
      role: dto.role,
      clientType: platform,
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
  async getUsers() {
    return await this.userRed.find({ select: USER_SELECT });
  }

  @CatchErrors()
  async updateUser(dto: UpdateUserDto, id: string, r: JwtReq) {
    const existedUser = await this.userRed.findOne({
      where: { id },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!existedUser) throw new HttpException('Пользователь не найден', 404);
    
    await this.userRed.update(id, dto);
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
  async getBanWords() {
    return await this.banWordRepo.find({
      relations: { createdUser: true },
      select: { createdAt: true, id: true, updatedAt: true, word: true, createdUser: USER_SELECT },
    });
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
}
