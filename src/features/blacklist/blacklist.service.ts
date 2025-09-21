import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Blacklist } from './entities/blacklist.entity';
import { Repository } from 'typeorm';
import { BLACKLIST_SELECT } from 'src/const/selects';
import { CreateBlacklistDto } from './dto/create-blacklist.dto';
import { User } from '../user/entities/user.entity';
import { UpdateBlacklistDto } from './dto/update-blacklist.dto';
import { CatchErrors } from 'src/const/check.decorator';

@Injectable()
export class BlacklistService {
  constructor(
    @InjectRepository(Blacklist)
    private readonly blacklistRep: Repository<Blacklist>,
    @InjectRepository(User)
    private readonly userRep: Repository<User>,
  ) {}

  async create(dto: CreateBlacklistDto, userId: string) {
    const user = await this.userRep.findOne({ where: { id: userId } });
    if (!user) throw new HttpException('Пользователь не найден', 404);
    const existed = await this.blacklistRep.findOne({
      where: { phone: dto.phone },
    });
    if (existed) throw new HttpException('Этот номер уже в черном списке', 400);
    return await this.blacklistRep.save({
      phone: dto.phone,
      comment: dto.comment,
      createdUser: user,
    });
  }

  async get() {
    return await this.blacklistRep.find({
      relations: { createdUser: true },
      select: BLACKLIST_SELECT,
    });
  }

  async getOneByNumber(phone: string) {
    return await this.blacklistRep.findOne({
      where: { phone },
      relations: { createdUser: true },
      select: BLACKLIST_SELECT,
    });
  }

  async getOneById(id: string) {
    return await this.blacklistRep.findOne({
      where: { id },
      relations: { createdUser: true },
      select: BLACKLIST_SELECT,
    });
  }

  async update(dto: UpdateBlacklistDto, id: string) {
    const entry = await this.blacklistRep.findOne({ where: { id } });
    if (!entry) throw new HttpException('Запись не найдена', 404);
    await this.blacklistRep.update(id, dto);
    return await this.blacklistRep.findOne({ where: { id } });
  }

  @CatchErrors()
  async delete(id: string) {
    await this.blacklistRep.delete(id);
    return { code: 200, message: 'Запись успешно удалена' };
  }
}
