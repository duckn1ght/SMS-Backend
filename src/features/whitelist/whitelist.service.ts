import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Whitelist } from './entities/whitelist.entity';
import { FindManyOptions, Repository } from 'typeorm';
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
    if (existed) throw new HttpException('Этот номер уже существует в белом списке', 400);
    if (blackExisted) throw new HttpException('Этот номер существует в черном списке', 400);

    await this.whitelistRep.save({ createdUser: existedUser, ...dto });
    return { statusCode: 201, message: 'Номер успешно добавлен в Белый Список' };
  }

  async get(
    take?: number,
    skip?: number,
    filters?: { search?: string; organization?: string; role?: string },
    order?: { orderBy?: string; orderDir?: 'ASC' | 'DESC' },
  ) {
    const options: FindManyOptions<Whitelist> = {
      relations: { createdUser: true },
      select: WHITELIST_SELECT,
      where: {} as Partial<Whitelist>,
    };
    // Поиск по номеру или fakeId через search
    if (filters?.search) {
      // Проверяем, можно ли безопасно привести к integer (Postgres)
      const isNumeric = /^\d+$/.test(filters.search);
      // Максимальное значение для int32: 2147483647
      const isInt32 = isNumeric && Number(filters.search) <= 2147483647;
      if (isInt32) {
        options.where = [{ fakeId: Number(filters.search) }, { phone: filters.search }];
      } else {
        options.where = [{ phone: filters.search }];
      }
    }
    if (filters?.organization) {
      if (Array.isArray(options.where)) {
        options.where = options.where.map((w) => ({ ...w, organization: filters.organization }));
      } else {
        (options.where as Partial<Whitelist>).organization = filters.organization;
      }
    }
    if (filters?.role) {
      if (Array.isArray(options.where)) {
        options.where = options.where.map((w) => ({ ...w, createdUser: { role: filters.role } as any }));
      } else {
        (options.where as Partial<Whitelist>).createdUser = { role: filters.role } as any;
      }
    }
    if (order?.orderBy) {
      options.order = { [order.orderBy]: order.orderDir || 'DESC' };
    } else {
      options.order = { createdAt: 'DESC' };
    }
    if (take) options.take = take;
    if (skip) options.skip = skip;
    const [data, total] = await this.whitelistRep.findAndCount(options);
    return {
      data,
      total,
      take,
      skip,
    };
  }

  async getOrgs() {
    return await this.whitelistRep.find({ select: { id: true, organization: true } });
  }

  async getOneByNumber(phone: string) {
    return await this.whitelistRep.findOne({
      where: { phone },
      select: WHITELIST_SELECT,
      relations: { createdUser: true },
    });
  }

  async getOneById(id: string) {
    return await this.whitelistRep.findOne({
      where: { id },
      select: WHITELIST_SELECT,
      relations: { createdUser: true },
    });
  }

  async update(dto: UpdateWhitelistDto, id: string) {
    await this.whitelistRep.update(id, dto);
    return { statusCode: 200, message: 'Запись успешно обновлена' };
  }

  async delete(id: string) {
    await this.whitelistRep.delete(id);
    return { statusCode: 204, message: 'Запись успешно удалена' };
  }
}
