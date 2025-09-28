import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { ActionLog } from './entities/action-log.entity';
import { CreateAppealDto } from '../appeal/dto/create-appeal.dto';
import { CreateLogDto } from './dto/create-log.dto';
import { CatchErrors } from 'src/const/check.decorator';
import { ACTION_LOG_SELECT } from 'src/const/selects';

@Injectable()
export class ActionLogService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(ActionLog)
    private readonly logRepo: Repository<ActionLog>,
  ) {}

  @CatchErrors()
  async createLog(dto: CreateLogDto, userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new HttpException('Пользователь по токену не найден', 403);
    await this.logRepo.save({ ...dto, user });
    return { statusCode: 201, message: 'Лог успешно создан' };
  }

  @CatchErrors()
  async get(take?: number, skip?: number) {
    const options: any = { relations: { user: true }, select: ACTION_LOG_SELECT };
    if (typeof take === 'number') options.take = take;
    if (typeof skip === 'number') options.skip = skip;
    const [data, total] = await this.logRepo.findAndCount(options);
    return { data, total, take, skip };
  }

  @CatchErrors()
  async getById(id: string) {
    return await this.logRepo.find({
      relations: { user: true },
      select: ACTION_LOG_SELECT,
      where: { id },
    });
  }

  @CatchErrors()
  async getByUserId(userId: string, take?: number, skip?: number) {
    const options: any = { relations: { user: true }, select: ACTION_LOG_SELECT, where: { user: { id: userId } } };
    if (typeof take === 'number') options.take = take;
    if (typeof skip === 'number') options.skip = skip;
    const [data, total] = await this.logRepo.findAndCount(options);
    return { data, total, take, skip };
  }

  @CatchErrors()
  async remove(id: string) {
    await this.logRepo.delete(id);
    return { statusCode: 204, message: 'Лог успешно удален' };
  }
}
