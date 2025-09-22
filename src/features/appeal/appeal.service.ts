import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAppealDto } from './dto/create-appeal.dto';
import { NewStatusAppealDto } from './dto/new-status-appeal.dto';
import { Appeal } from './entities/appeal.entity';

@Injectable()
export class AppealService {
  constructor(
    @InjectRepository(Appeal)
    private readonly appealRepo: Repository<Appeal>,
  ) {}

  /** Создание обращения */
  async create(dto: CreateAppealDto) {
    await this.appealRepo.save(dto);
    return { code: 201, message: 'Обращение успешно создано' };
  }

  /** Просмотр всех обращений */
  async findAll() {
    return await this.appealRepo.find();
  }

  /** Получение одного обращения по id */
  async findOne(id: string) {
    return await this.appealRepo.findOne({ where: { id } });
  }

  /** Получение всех обращений одного пользователя */
  async findAllByPhone(userId: string) {
    return await this.appealRepo.find({ where: { createdUser: { id: userId } } });
  }

  /** Удаление обращения  */
  async remove(id: string) {
    await this.appealRepo.delete(id);
    return { code: 204, message: 'Обращение удалено' };
  }

  /** Обновление статуса обращения  */
  async updateStatus(id: string, dto: NewStatusAppealDto) {
    await this.appealRepo.update(id, { status: dto.status });
    return { code: 200, message: 'Статус обращения обновлён' };
  }
}
