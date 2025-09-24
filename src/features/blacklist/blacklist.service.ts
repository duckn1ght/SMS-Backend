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
import { ActionLogService } from '../action-log/action-log.service';
import type { JwtReq } from '../auth/types/jwtReq.type';
import { ACTION_LOG_TYPE } from '../action-log/types/action-log.type';

@Injectable()
export class BlacklistService {
  constructor(
    @InjectRepository(Blacklist)
    private readonly blacklistRep: Repository<Blacklist>,
    @InjectRepository(Whitelist)
    private readonly whitelistRep: Repository<Whitelist>,
    @InjectRepository(User)
    private readonly userRep: Repository<User>,
    private logService: ActionLogService,
  ) {}

  @CatchErrors()
  async create(dto: CreateBlacklistDto, r: JwtReq) {
    const user = await this.userRep.findOne({ where: { id: r.user.id } });
    if (!user) throw new HttpException('Пользователь по токену не найден', 403);
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
    await this.logService.createLog(
      {
        message: `Пользователь ${r.user.name} добавил номер ${dto.phone} в Черный Список`,
        type: ACTION_LOG_TYPE.INFO,
      },
      r.user.id,
    );
    return { code: 201, message: 'Номер успешно добавлен в Черный Список' };
  }

  @CatchErrors()
  async get() {
    return await this.blacklistRep.find({
      relations: { createdUser: true, reports: true },
      select: BLACKLIST_SELECT,
    });
  }

  @CatchErrors()
  async getOneByNumber(phone: string) {
    return await this.blacklistRep.findOne({
      where: { phone },
      relations: { createdUser: true, reports: true },
      select: BLACKLIST_SELECT,
    });
  }

  @CatchErrors()
  async getOneById(id: string) {
    return await this.blacklistRep.findOne({
      where: { id },
      relations: { createdUser: true, reports: true },
      select: BLACKLIST_SELECT,
    });
  }

  @CatchErrors()
  async update(dto: UpdateBlacklistDto, id: string, r: JwtReq) {
    const entry = await this.blacklistRep.findOne({ where: { id } });
    if (!entry) throw new HttpException('Запись не найдена', 404);
    await this.blacklistRep.update(id, dto);
    const updatedBlacklist = await this.blacklistRep.findOne({ where: { id: id } });
    await this.logService.createLog(
      {
        message: `Пользователь ${r.user.name} обновил запись о номере ${updatedBlacklist?.phone} в Черном Списке`,
        type: ACTION_LOG_TYPE.INFO,
      },
      r.user.id,
    );
    return { code: 200, message: 'Запись успешно обновлена' };
  }

  @CatchErrors()
  async delete(id: string, r: JwtReq) {
    await this.blacklistRep.delete(id);
    const deletedBlacklist = await this.blacklistRep.findOne({ where: { id: id } });
    await this.logService.createLog(
      {
        message: `Пользователь ${r.user.name} обновил запись о номере ${deletedBlacklist?.phone} в Черном Списке`,
        type: ACTION_LOG_TYPE.INFO,
      },
      r.user.id,
    );
    return { code: 204, message: 'Запись успешно удалена' };
  }
}
