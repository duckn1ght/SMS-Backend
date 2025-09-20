import { Catch, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { CLIENT_TYPE, USER_ROLE } from '../user/types/user.types';
import { USER_SELECT } from 'src/const/selects';
import { CatchErrors } from 'src/const/check.decorator';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRed: Repository<User>,
  ) {}

  @CatchErrors()
  async createUser(dto: CreateUserDto) {
    const existedUser = await this.userRed.findOne({
      where: { phone: dto.phone },
      select: { id: true },
    });
    if (existedUser) {
      return { code: 400, message: 'Этот номер телефона уже зарегистрирован' };
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const platform =
      dto.role === USER_ROLE.USER ? CLIENT_TYPE.ANDROID : CLIENT_TYPE.WEB;
    console.log(platform);
    await this.userRed.save({
      phone: dto.phone,
      name: dto.name,
      password: hashedPassword,
      role: dto.role,
      clientType: platform,
    });
    return { code: 201, message: 'Новый пользователь успешно создан' };
  }

  @CatchErrors()
  async getUsers() {
    return await this.userRed.find({ select: USER_SELECT });
  }
}
