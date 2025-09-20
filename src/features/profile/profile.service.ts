import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { USER_SELECT } from 'src/const/selects';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import { CatchErrors } from 'src/const/check.decorator';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRep: Repository<User>,
  ) {}

  @CatchErrors()
  async findOneById(id: string) {
    return await this.userRep.findOne({ where: { id }, select: USER_SELECT });
  }

  @CatchErrors()
  async changePassword(id: string, dto: ChangePasswordDto) {
    const existedUser = await this.userRep.findOne({
      where: { id },
      select: { password: true },
    });
    if (!existedUser) return { code: 404, message: 'Пользователь не найден' };
    const isMatch = await bcrypt.compare(dto.oldPassword, existedUser.password);
    if (isMatch) {
      const newHashedPassword = await bcrypt.hash(dto.newPassword, 10);
      await this.userRep.update(id, {
        password: newHashedPassword,
      });
      return { code: 200, message: 'Пароль успешно изменен' };
    } else {
      return { code: 400, message: 'Указан неверный старый пароль' };
    }
  }
}
