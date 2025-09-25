import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blacklist } from '../blacklist/entities/blacklist.entity';
import { User } from '../user/entities/user.entity';
import { Whitelist } from '../whitelist/entities/whitelist.entity';
import { Appeal } from '../appeal/entities/appeal.entity';
import { Report } from '../report/entities/report.entity';
import { StatisticsGateway } from './statistics.gateway';
import 'pdfkit-table';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Report)
    private readonly reportRepo: Repository<Report>,
    @InjectRepository(Blacklist)
    private readonly blacklistRepo: Repository<Blacklist>,
    @InjectRepository(Whitelist)
    private readonly whitelistRepo: Repository<Whitelist>,
    @InjectRepository(Appeal)
    private readonly appealRepo: Repository<Appeal>,
    private readonly statisticsGateway: StatisticsGateway,
  ) {}

  async getStatistics() {
    // 1. Количество обращений по статусам
    const appealsByStatus = await this.appealRepo
      .createQueryBuilder('appeal')
      .select('appeal.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('appeal.status')
      .getRawMany();

    // 2. Количество обращений по регионам (по city пользователя)
    const appealsByRegion = await this.appealRepo
      .createQueryBuilder('appeal')
      .leftJoin('appeal.createdUser', 'user')
      .select('user.city', 'city')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.city')
      .getRawMany();

    // 3. Количество номеров в ЧС/БС по группам пользователей
    const blacklistByGroup = await this.blacklistRepo
      .createQueryBuilder('bl')
      .leftJoin('bl.createdUser', 'user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    const whitelistByGroup = await this.whitelistRepo
      .createQueryBuilder('wl')
      .leftJoin('wl.createdUser', 'user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    // 4. Динамика изменений ЧС/БС за сутки, месяц
    const blacklistDay = await this.blacklistRepo
      .createQueryBuilder('bl')
      .where("bl.createdAt >= NOW() - INTERVAL '1 day'")
      .getCount();

    const blacklistMonth = await this.blacklistRepo
      .createQueryBuilder('bl')
      .where("bl.createdAt >= NOW() - INTERVAL '1 month'")
      .getCount();

    const whitelistDay = await this.whitelistRepo
      .createQueryBuilder('wl')
      .where("wl.createdAt >= NOW() - INTERVAL '1 day'")
      .getCount();

    const whitelistMonth = await this.whitelistRepo
      .createQueryBuilder('wl')
      .where("wl.createdAt >= NOW() - INTERVAL '1 month'")
      .getCount();

    return {
      appealsByStatus,
      appealsByRegion,
      blacklistByGroup,
      whitelistByGroup,
      blacklistDay,
      blacklistMonth,
      whitelistDay,
      whitelistMonth,
      activeUsers: this.statisticsGateway.activeUsers.size,
      // maliciousSmsCount,
      // maliciousCallsCount,
    };
  }

  async getPdfStatistics() {
    const stats = await this.getStatistics();

    const PDFDocument = (await import('pdfkit')).default || (await import('pdfkit'));
  }
}
