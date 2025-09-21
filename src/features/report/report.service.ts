import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Blacklist } from '../blacklist/entities/blacklist.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { Report } from './entities/report.entity';
import { User } from '../user/entities/user.entity';
import { BLACKLIST_STATUS } from '../blacklist/types/blacklist.types';
import { REPORT_SELECT } from 'src/const/selects';

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
  ) {}

  async create(dto: CreateReportDto, userId: string) {
    const existedBlacklist = await this.blacklistRep.findOne({
      where: { phone: dto.phone },
    });
    const user = await this.userRep.findOne({ where: { id: userId } });
    if (!user) throw new HttpException('Пользователь не найден', 404);

    if (existedBlacklist) {
      const newReport = await this.reportRep.save({
        createdUser: user,
        comment: dto.comment,
        blacklist: existedBlacklist,
      });
      return newReport;
    } else {
      // Транзакция для Blacklist и Report
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
        const newReport = await queryRunner.manager.save(Report, {
          createdUser: user,
          comment: dto.comment,
          blacklist: newBlacklist,
        });
        await queryRunner.commitTransaction();
        return newReport;
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    }
  }

  async findAll() {
    return await this.reportRep.find({
      relations: { createdUser: true, blacklist: true },
      order: { createdAt: 'DESC' },
      select: REPORT_SELECT,
    });
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
}
