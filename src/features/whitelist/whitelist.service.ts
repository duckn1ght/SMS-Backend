import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Whitelist } from './entities/whitelist.entity';
import { Repository } from 'typeorm';
import { WHITELIST_SELECT } from 'src/const/selects';
import { CreateWhitelistDto } from './dto/create-whitelist.dto';
import { UpdateWhitelistDto } from './dto/update-whitelist.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class WhitelistService {
  constructor(
    @InjectRepository(Whitelist)
    private whitelistRep: Repository<Whitelist>,
    @InjectRepository(User)
    private userRep: Repository<User>,
  ) {}

  async create(dto: CreateWhitelistDto, userId: string) {
    const existedUser = await this.userRep.findOne({ where: { id: userId } });
    if (!existedUser) throw new HttpException('Пользователь не найден', 404);

    return await this.whitelistRep.save({
      createdUser: existedUser,
      ...dto,
    });
  }

  async get() {
    return await this.whitelistRep.find({
      select: WHITELIST_SELECT,
    });
  }

  async getOneByNumber(phone: string) {
    return await this.whitelistRep.findOne({
      where: { phone },
      select: WHITELIST_SELECT,
    });
  }

  async getOneById(id: string) {
    return await this.whitelistRep.findOne({
      where: { id },
      select: WHITELIST_SELECT,
    });
  }

  async update(dto: UpdateWhitelistDto, id: string) {
    return await this.whitelistRep.update(id, dto);
  }

  async delete(id: string) {
    await this.whitelistRep.delete(id);
    return { code: 200, message: 'Запись успешно удалена' };
  }
}
