import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { CreateAppealDto } from './dto/create-appeal.dto';
import { ResponseStatusAppealDto } from './dto/response-status-appeal.dto';
import { Appeal } from './entities/appeal.entity';
import { UpdateAppealDto } from './dto/update-appeal.dto';
import { User } from '../user/entities/user.entity';
import { ActionLogService } from '../action-log/action-log.service';
import type { JwtReq } from '../auth/types/jwtReq.type';
import { ACTION_LOG_TYPE } from '../action-log/types/action-log.type';
import { NotificationService } from '../notification/notification.service';
import { ResponseAppealNotificationText, ResponseAppealNotificationTitle } from 'src/const/notifications';
import { APPEAL_STATUS } from './types/appeal.type';
import { USER_ROLE } from '../user/types/user.types';

@Injectable()
export class AppealService {
  constructor(
    @InjectRepository(Appeal)
    private readonly appealRepo: Repository<Appeal>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private logService: ActionLogService,
    private notificationService: NotificationService,
  ) {}

  async create(dto: CreateAppealDto, r: JwtReq) {
    const user = await this.userRepo.findOne({ where: { id: r.user.id } });
    if (!user) throw new HttpException('Пользователь по токену не найден', 403);
    await this.appealRepo.save({ ...dto, createdUser: user });
    await this.logService.createLog(
      { type: ACTION_LOG_TYPE.INFO, message: `Пользователь ${r.user.name} создал обращение` },
      r.user.id,
    );
    return { statusCode: 201, message: 'Обращение успешно создано' };
  }

  async findAll(
    take?: number,
    skip?: number,
    filters?: { status?: APPEAL_STATUS; region?: string; role?: USER_ROLE; search?: string },
    order?: { orderBy?: string; orderDir?: 'ASC' | 'DESC' },
  ) {
    const options: FindManyOptions<Appeal> = {};
    options.where = {};
    if (filters?.status) options.where.status = filters.status;
    // Поиск по номеру или fakeId через search
    if (filters?.search) {
      const isNumeric = /^\d+$/.test(filters.search);
      const isInt32 = isNumeric && Number(filters.search) <= 2147483647;
      if (isInt32) {
        options.where = [{ fakeId: Number(filters.search) }, { phone: filters.search }, { userPhone: filters.search }];
      } else {
        options.where = [{ phone: filters.search }, { userPhone: filters.search }];
      }
    }
    if (filters?.region) {
      if (Array.isArray(options.where)) {
        options.where = options.where.map((w) => ({ ...w, createdUser: { region: filters.region } }));
      } else {
        options.where.createdUser = { region: filters.region };
      }
    }
    if (filters?.role) {
      if (Array.isArray(options.where)) {
        options.where = options.where.map((w) => ({ ...w, createdUser: { role: filters.role } }));
      } else {
        options.where.createdUser = { role: filters.role };
      }
    }

    if (order?.orderBy) {
      options.order = { [order.orderBy]: order.orderDir || 'DESC' };
    } else {
      options.order = { createdAt: 'DESC' };
    }

    if (take) options.take = take;
    if (skip) options.skip = skip;
    const [data, total] = await this.appealRepo.findAndCount(options);
    return {
      data,
      total,
      take,
      skip,
    };
  }

  async findOne(id: string) {
    return await this.appealRepo.findOne({ where: { id } });
  }

  async findAllByUser(userId: string, take?: number, skip?: number) {
    const options = { where: { createdUser: { id: userId } } };
    if (take) Object.assign(options, { take });
    if (skip) Object.assign(options, { skip });
    const [data, total] = await this.appealRepo.findAndCount(options);
    return {
      data,
      total,
      take,
      skip,
    };
  }

  async remove(id: string, r: JwtReq) {
    await this.appealRepo.delete(id);
    await this.logService.createLog(
      { type: ACTION_LOG_TYPE.INFO, message: `Пользователь ${r.user.name} удалил обращение` },
      r.user.id,
    );
    return { statusCode: 204, message: 'Обращение удалено' };
  }

  async update(id: string, dto: UpdateAppealDto, r: JwtReq) {
    await this.appealRepo.update(id, dto);
    await this.logService.createLog(
      { type: ACTION_LOG_TYPE.INFO, message: `Пользователь ${r.user.name} обновил обращение` },
      r.user.id,
    );
    return { statusCode: 200, message: 'Обращение успешно обновлено' };
  }

  async response(id: string, dto: ResponseStatusAppealDto, r: JwtReq) {
    const appeal = await this.appealRepo.findOne({ where: { id }, relations: { createdUser: true } });
    if (!appeal) throw new HttpException('Обращение не найдено', 404);
    await this.appealRepo.update(id, dto);
    await this.logService.createLog(
      { type: ACTION_LOG_TYPE.INFO, message: `Пользователь ${r.user.name} откликнулся обращения` },
      r.user.id,
    );
    await this.notificationService.sendPush(
      appeal.createdUser.id,
      ResponseAppealNotificationTitle,
      ResponseAppealNotificationText,
    );
    return { statusCode: 200, message: 'Статус обращения обновлён' };
  }
}
