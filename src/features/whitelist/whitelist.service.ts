import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Whitelist } from './entities/whitelist.entity';
import { Repository } from 'typeorm';
import { WHITELIST_SELECT } from 'src/const/selects';
import { CreateWhitelistDto } from './dto/create-whitelist.dto';
import { UpdateWhitelistDto } from './dto/update-whitelist.dto';
import { User } from '../user/entities/user.entity';
import { Blacklist } from '../blacklist/entities/blacklist.entity';

@Injectable()
export class WhitelistService {
  constructor(
    @InjectRepository(Whitelist)
    private whitelistRep: Repository<Whitelist>,
    @InjectRepository(Blacklist)
    private blacklistRep: Repository<Blacklist>,
    @InjectRepository(User)
    private userRep: Repository<User>,
  ) {}

  async create(dto: CreateWhitelistDto, userId: string) {
    const existedUser = await this.userRep.findOne({ where: { id: userId } });
    if (!existedUser) throw new HttpException('Пользователь не найден', 404);
    const [existed, blackExisted] = await Promise.all([
      this.whitelistRep.findOne({ where: { phone: dto.phone } }),
      this.blacklistRep.findOne({ where: { phone: dto.phone } }),
    ]);
    if (existed) return new HttpException('Этот номер уже существует в белом списке', 400);
    if (blackExisted) return new HttpException('Этот номер существует в черном списке', 400);

    await this.whitelistRep.save({ createdUser: existedUser, ...dto });
    return { code: 201, message: 'Номер успешно добавлен в Белый Список' };
  }

  async get() {
    return await this.whitelistRep.find({ select: WHITELIST_SELECT });
  }

  async getOrgs() {
    return await this.whitelistRep.find({ select: { id: true, organization: true} });
  }

  async getOneByNumber(phone: string) {
    return await this.whitelistRep.findOne({ where: { phone }, select: WHITELIST_SELECT });
  }

  async getOneById(id: string) {
    return await this.whitelistRep.findOne({ where: { id }, select: WHITELIST_SELECT });
  }

  async update(dto: UpdateWhitelistDto, id: string) {
    await this.whitelistRep.update(id, dto);
    return { code: 200, message: 'Запись успешно обновлена' };
  }

  async delete(id: string) {
    await this.whitelistRep.delete(id);
    return { code: 204, message: 'Запись успешно удалена' };
  }
}
