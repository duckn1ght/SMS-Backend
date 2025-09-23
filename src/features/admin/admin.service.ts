import { Catch, Injectable } from '@nestjs/common';
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

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRed: Repository<User>,
    private logService: ActionLogService,
  ) {}

  @CatchErrors()
  async createUser(dto: CreateUserDto, r: JwtReq) {
    const existedUser = await this.userRed.findOne({
      where: { phone: dto.phone },
      select: { id: true },
    });
    if (existedUser) {
      return { code: 400, message: 'Этот номер телефона уже зарегистрирован' };
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const platform = dto.role === USER_ROLE.USER ? CLIENT_TYPE.ANDROID : CLIENT_TYPE.WEB;
    console.log(platform);
    await this.userRed.save({
      phone: dto.phone,
      name: dto.name,
      password: hashedPassword,
      role: dto.role,
      clientType: platform,
    });
    await this.logService.createLog(
      {
        message: `Администратор ${r.user.name} создал нового пользователя`,
        type: ACTION_LOG_TYPE.INFO,
      },
      r.user.id,
    );
    return { code: 201, message: 'Новый пользователь успешно создан' };
  }

  @CatchErrors()
  async getUsers() {
    return await this.userRed.find({ select: USER_SELECT });
  }
}
