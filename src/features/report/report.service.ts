import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, FindManyOptions, ILike } from 'typeorm';
import { Blacklist } from '../blacklist/entities/blacklist.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { Report } from './entities/report.entity';
import { User } from '../user/entities/user.entity';
import { BLACKLIST_STATUS } from '../blacklist/types/blacklist.types';
import { REPORT_SELECT } from 'src/const/selects';
import { JwtReq } from '../auth/types/jwtReq.type';
import { ActionLogService } from '../action-log/action-log.service';
import { ACTION_LOG_TYPE } from '../action-log/types/action-log.type';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private reportRep: Repository<Report>,
    @InjectRepository(Blacklist)
    private blacklistRep: Repository<Blacklist>,
    @InjectRepository(User)
    private userRep: Repository<User>,
    private dataSource: DataSource,
    private logService: ActionLogService,
  ) {}

  async create(dto: CreateReportDto, r: JwtReq) {
    const existedBlacklist = await this.blacklistRep.findOne({
      where: { phone: dto.phone },
    });
    const user = await this.userRep.findOne({ where: { id: r.user.id } });
    if (!user) throw new HttpException('Пользователь не найден', 404);

    if (existedBlacklist) {
      const newReport = await this.reportRep.save({
        createdUser: user,
        comment: dto.comment,
        blacklist: existedBlacklist,
      });
      return newReport;
    } else {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        const newBlacklist = await queryRunner.manager.save(Blacklist, {
          phone: dto.phone,
          status: BLACKLIST_STATUS.REVIEW,
          comment: dto.comment,
          createdUser: user,
        });
        await queryRunner.manager.save(Report, {
          createdUser: user,
          comment: dto.comment,
          blacklist: newBlacklist,
        });
        await this.logService.createLog(
          {
            message: `Пользователь ${r.user.name} создал жалобу на номер ${dto.phone}`,
            type: ACTION_LOG_TYPE.INFO,
          },
          r.user.id,
        );
        await queryRunner.commitTransaction();
        return { statusCode: 201, message: 'Жалоба на номер успешно создана' };
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    }
  }

  async findAll(
    take?: number,
    skip?: number,
    filters?: { search?: string; role?: string; region?: string },
    order?: { orderBy?: string; orderDir?: 'ASC' | 'DESC' },
  ) {
    const options: FindManyOptions<Report> = {
      relations: { createdUser: true, blacklist: true },
      select: REPORT_SELECT,
    };

    // Поиск по fakeId или номеру создателя
    if (filters?.search) {
      const isNumeric = /^\d+$/.test(filters.search);
      const isInt32 = isNumeric && Number(filters.search) <= 2147483647;

      if (isInt32) {
        options.where = [{ fakeId: Number(filters.search) }, { createdUser: { phone: ILike(`%${filters.search}%`) } }];
      } else {
        options.where = [{ createdUser: { phone: ILike(`%${filters.search}%`) } }];
      }

      // Добавляем фильтры к каждому условию поиска
      if (filters.role || filters.region) {
        options.where = (options.where as Array<Record<string, any>>).map((w) => ({
          ...w,
          createdUser: {
            ...w.createdUser,
            ...(filters.role && { role: filters.role }),
            ...(filters.region && { region: filters.region }),
          },
        }));
      }
    } else {
      // Обычные фильтры без поиска
      options.where = {};
      if (filters?.role || filters?.region) {
        (options.where as any).createdUser = {
          ...(filters.role && { role: filters.role }),
          ...(filters.region && { region: filters.region }),
        };
      }
    }

    // Сортировка
    if (order?.orderBy) {
      options.order = { [order.orderBy]: order.orderDir || 'DESC' };
    } else {
      options.order = { createdAt: 'DESC' };
    }

    if (take) options.take = take;
    if (skip) options.skip = skip;

    const [data, total] = await this.reportRep.findAndCount(options);
    return {
      data,
      total,
      take,
      skip,
    };
  }

  async findByUser(userId: string) {
    return await this.reportRep.find({
      where: { createdUser: { id: userId } },
    });
  }

  async findById(id: string) {
    const report = await this.reportRep.findOne({
      where: { id },
      relations: { createdUser: true, blacklist: true },
      select: REPORT_SELECT,
    });
    if (!report) throw new HttpException('Жалоба не найдена', 404);
    return report;
  }

  async remove(id: string, r: JwtReq) {
    const deletingBlacklist = await this.reportRep.findOne({ where: { id }, relations: { blacklist: true } });
    if (!deletingBlacklist) throw new HttpException('Жалоба не найдена', 404);
    await this.reportRep.remove(deletingBlacklist);
    await this.logService.createLog(
      {
        message: `Пользователь ${r.user.name} удалил свою жалобу на номер ${deletingBlacklist.blacklist.phone}`,
        type: ACTION_LOG_TYPE.INFO,
      },
      r.user.id,
    );
    return { statusCode: 204, message: 'Жалоба на номер успешно удалена' };
  }
}
