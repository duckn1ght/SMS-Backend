import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { USER_SELECT } from 'src/const/selects';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import { CatchErrors } from 'src/const/check.decorator';
import { ActionLogService } from '../action-log/action-log.service';
import type { JwtReq } from '../auth/types/jwtReq.type';
import { ACTION_LOG_TYPE } from '../action-log/types/action-log.type';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRep: Repository<User>,
    private logService: ActionLogService,
  ) {}

  @CatchErrors()
  async findOneById(id: string) {
    return await this.userRep.findOne({ where: { id }, select: USER_SELECT });
  }

  @CatchErrors()
  async changePassword(r: JwtReq, dto: ChangePasswordDto) {
    const existedUser = await this.userRep.findOne({
      where: { id: r.user.id },
      select: { password: true },
    });
    if (!existedUser) return new HttpException('Пользователь не найден', 404);
    const isMatch = await bcrypt.compare(dto.oldPassword, existedUser.password);
    if (isMatch) {
      const newHashedPassword = await bcrypt.hash(dto.newPassword, 10);
      await this.userRep.update(r.user.id, {
        password: newHashedPassword,
      });
      this.logService.createLog(
        {
          message: `Пользователь ${r.user.name} сменил пароль`,
          type: ACTION_LOG_TYPE.INFO,
        },
        r.user.id,
      );
      return { statusCode: 200, message: 'Пароль успешно изменен' };
    } else {
      return new HttpException('Указан неверный старый пароль', 400);
    }
  }
}
