import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Blacklist } from './entities/blacklist.entity';
import { Repository } from 'typeorm';
import { BLACKLIST_SELECT } from 'src/const/selects';
import { CreateBlacklistDto } from './dto/create-blacklist.dto';
import { User } from '../user/entities/user.entity';
import { UpdateBlacklistDto } from './dto/update-blacklist.dto';
import { CatchErrors } from 'src/const/check.decorator';
import { BLACKLIST_STATUS } from './types/blacklist.types';
import { Whitelist } from '../whitelist/entities/whitelist.entity';

@Injectable()
export class BlacklistService {
  constructor(
    @InjectRepository(Blacklist)
    private readonly blacklistRep: Repository<Blacklist>,
    @InjectRepository(Whitelist)
    private readonly whitelistRep: Repository<Whitelist>,
    @InjectRepository(User)
    private readonly userRep: Repository<User>,
  ) {}

  async create(dto: CreateBlacklistDto, userId: string) {
    const user = await this.userRep.findOne({ where: { id: userId } });
    if (!user) throw new HttpException('Пользователь не найден', 404);
    const [existed, whiteExisted] = await Promise.all([
      this.blacklistRep.findOne({ where: { phone: dto.phone } }),
      this.whitelistRep.findOne({ where: { phone: dto.phone } }),
    ]);
    if (existed) throw new HttpException('Этот номер уже в Черном Списке', 400);
    if (whiteExisted) throw new HttpException('Этот номер в Белом Списке', 400);
    await this.blacklistRep.save({
      phone: dto.phone,
      comment: dto.comment,
      createdUser: user,
      status: BLACKLIST_STATUS.REVIEW,
    });
    return { code: 201, message: 'Номер успешно добавлен в Черный Список' };
  }

  async get() {
    return await this.blacklistRep.find({
      relations: { createdUser: true, reports: true },
      select: BLACKLIST_SELECT,
    });
  }

  async getOneByNumber(phone: string) {
    return await this.blacklistRep.findOne({
      where: { phone },
      relations: { createdUser: true, reports: true },
      select: BLACKLIST_SELECT,
    });
  }

  async getOneById(id: string) {
    return await this.blacklistRep.findOne({
      where: { id },
      relations: { createdUser: true, reports: true },
      select: BLACKLIST_SELECT,
    });
  }

  async update(dto: UpdateBlacklistDto, id: string) {
    const entry = await this.blacklistRep.findOne({ where: { id } });
    if (!entry) throw new HttpException('Запись не найдена', 404);
    await this.blacklistRep.update(id, dto);
    return { code: 200, message: 'Запись успешно обновлена' };
  }

  @CatchErrors()
  async delete(id: string) {
    await this.blacklistRep.delete(id);
    return { code: 204, message: 'Запись успешно удалена' };
  }
}
