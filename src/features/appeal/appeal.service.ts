import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAppealDto } from './dto/create-appeal.dto';
import { NewStatusAppealDto } from './dto/new-status-appeal.dto';
import { Appeal } from './entities/appeal.entity';
import { UpdateAppealDto } from './dto/update-appeal.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AppealService {
  constructor(
    @InjectRepository(Appeal)
    private readonly appealRepo: Repository<Appeal>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateAppealDto, userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new HttpException('Пользователь не авторизирован', 403);
    await this.appealRepo.save({ ...dto, createdUser: user });
    return { code: 201, message: 'Обращение успешно создано' };
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

  async remove(id: string) {
    await this.appealRepo.delete(id);
    return { code: 204, message: 'Обращение удалено' };
  }

  async update(id: string, dto: UpdateAppealDto) {
    await this.appealRepo.update(id, dto);
    return { code: 200, message: 'Обращение успешно обновлено' };
  }

  async updateStatus(id: string, dto: NewStatusAppealDto) {
    await this.appealRepo.update(id, { status: dto.status });
    return { code: 200, message: 'Статус обращения обновлён' };
  }
}
