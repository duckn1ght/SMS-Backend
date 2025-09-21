import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Whitelist } from '../whitelist/entities/whitelist.entity';
import { Blacklist } from '../blacklist/entities/blacklist.entity';
import { Repository } from 'typeorm';
import { BLACKLIST_SELECT, WHITELIST_SELECT } from 'src/const/selects';
import { Report } from '../report/entities/report.entity';

@Injectable()
export class PhoneService {
  constructor(
    @InjectRepository(Whitelist)
    private whitelistRep: Repository<Whitelist>,
    @InjectRepository(Blacklist)
    private blacklistRep: Repository<Blacklist>,
    @InjectRepository(Report)
    private reportRep: Repository<Report>,
  ) {}

  async phoneCheck(phone: string) {
    const inWhitelist = await this.whitelistRep.findOne({
      where: { phone },
      select: WHITELIST_SELECT,
    });
    if (inWhitelist) return { status: 'whitelist', data: inWhitelist };

    const inBlacklist = await this.blacklistRep.findOne({
      where: { phone },
      select: BLACKLIST_SELECT,
    });
    const reportCount = await this.reportRep.count({
      where: { blacklist: { phone } },
    });
    if (inBlacklist)
      return { status: 'blacklist', reportCount, data: inBlacklist };

    return { status: 'Номера нет в базе данных', code: 200 };
  }
}
