import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Whitelist } from '../whitelist/entities/whitelist.entity';
import { Blacklist } from '../blacklist/entities/blacklist.entity';
import { Repository } from 'typeorm';
import { BLACKLIST_SELECT, WHITELIST_SELECT } from 'src/const/selects';
import { Report } from '../report/entities/report.entity';
import { Detection } from './entities/detection.entity';
import { DETECTION_TYPE } from './types/detection.type';
import { JwtReq } from '../auth/types/jwtReq.type';
import { User } from '../user/entities/user.entity';

@Injectable()
export class PhoneService {
  constructor(
    @InjectRepository(Whitelist)
    private whitelistRep: Repository<Whitelist>,
    @InjectRepository(Blacklist)
    private blacklistRep: Repository<Blacklist>,
    @InjectRepository(Report)
    private reportRep: Repository<Report>,
    @InjectRepository(Detection)
    private detectionRep: Repository<Detection>,
    @InjectRepository(User)
    private userRep: Repository<User>,
  ) {}

  async phoneCheck(phone: string, r: JwtReq) {
    const user = await this.userRep.findOne({ where: { id: r.user.id } });
    if (!user) throw new HttpException('Пользователь по токену не найден', 403);
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
    if (inBlacklist) {
      await this.detectionRep.save({ type: DETECTION_TYPE.PHONE, createdUser: user });
      return { status: 'blacklist', reportCount, data: inBlacklist };
    }

    return { status: 'Номера нет в базе данных', statusCode: 200 };
  }
}
