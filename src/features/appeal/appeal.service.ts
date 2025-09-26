import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAppealDto } from './dto/create-appeal.dto';
import { NewStatusAppealDto } from './dto/new-status-appeal.dto';
import { Appeal } from './entities/appeal.entity';
import { UpdateAppealDto } from './dto/update-appeal.dto';
import { User } from '../user/entities/user.entity';
import { ActionLogService } from '../action-log/action-log.service';
import type { JwtReq } from '../auth/types/jwtReq.type';
import { ACTION_LOG_TYPE } from '../action-log/types/action-log.type';

@Injectable()
export class AppealService {
  constructor(
    @InjectRepository(Appeal)
    private readonly appealRepo: Repository<Appeal>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private logService: ActionLogService,
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

  async findAll() {
    return await this.appealRepo.find();
  }

  async findOne(id: string) {
    return await this.appealRepo.findOne({ where: { id } });
  }

  async findAllByUser(userId: string) {
    return await this.appealRepo.find({ where: { createdUser: { id: userId } } });
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

  async updateStatus(id: string, dto: NewStatusAppealDto, r: JwtReq) {
    await this.appealRepo.update(id, { status: dto.status });
    await this.logService.createLog(
      { type: ACTION_LOG_TYPE.INFO, message: `Пользователь ${r.user.name} обновил статус обращения` },
      r.user.id,
    );
    return { statusCode: 200, message: 'Статус обращения обновлён' };
  }
}
