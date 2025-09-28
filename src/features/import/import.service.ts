import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import path from 'path';
import * as fs from 'fs';
import * as xlsx from 'xlsx';
import { CatchErrors } from 'src/const/check.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Whitelist } from '../whitelist/entities/whitelist.entity';
import { Repository } from 'typeorm';
import { Blacklist } from '../blacklist/entities/blacklist.entity';
import { ActionLogService } from '../action-log/action-log.service';
import type { JwtReq } from '../auth/types/jwtReq.type';
import { User } from '../user/entities/user.entity';
import { ACTION_LOG_TYPE } from '../action-log/types/action-log.type';
import { BLACKLIST_STATUS } from '../blacklist/types/blacklist.types';

@Injectable()
export class ImportService {
  constructor(
    @InjectRepository(User)
    private readonly userRep: Repository<User>,
    @InjectRepository(Whitelist)
    private readonly whitelistRep: Repository<Whitelist>,
    @InjectRepository(Blacklist)
    private readonly blacklistRep: Repository<Blacklist>,
    private readonly logSerive: ActionLogService,
    private readonly logger: Logger,
  ) {}

  @CatchErrors()
  async importFromXlsx(file: Buffer, r: JwtReq) {
    const createdUser = await this.userRep.findOne({ where: { id: r.user.id } });
    if (!createdUser) throw new HttpException('Пользователь по токену не найден', 403);
    const uploadsDir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `excel_upload.xlsx`;
    const absFilePath = path.join(uploadsDir, fileName);

    fs.writeFileSync(absFilePath, file);

    const workbook = xlsx.read(file, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!worksheet) throw new HttpException('Лист не найден в Excel файле', HttpStatus.BAD_REQUEST);

    const jsonData: ExcelRow[] = xlsx.utils.sheet_to_json(worksheet, { defval: null });
    let n: ExcelRow;
    for (n of jsonData) {
      const listValue = n.Список.toLowerCase().trim();
      if (listValue == 'черный') {
        const existedNumber = await this.blacklistRep.findOne({ where: { phone: n['Номер телефона'] } });
        if (!existedNumber) {
          await this.blacklistRep.save({
            phone: n['Номер телефона'],
            createdUser,
            status: BLACKLIST_STATUS.ACCEPTED,
          });
        } else {
          this.logger.debug(`Номер ${n['Номер телефона']} уже записан в БД`, 'ImportService');
        }
      } else if (listValue === 'белый') {
        const existedNumber = await this.blacklistRep.findOne({ where: { phone: n['Номер телефона'] } });
        if (!existedNumber) {
          await this.whitelistRep.save({
            phone: n['Номер телефона'],
            createdUser,
            organization: n['Наименование организации'] || 'Неизвестная организация',
          });
        } else {
          this.logger.debug(`Номер ${n['Номер телефона']} уже записан в БД`, 'ImportService');
        }
      }
    }
    await this.logSerive.createLog(
      {
        message: `Пользователь ${createdUser.name} импортировал данные в систему`,
        type: ACTION_LOG_TYPE.INFO,
      },
      r.user.id,
    );
    return jsonData;
  }
}

class ExcelRow {
  'Список': string;
  'Номер телефона': string;
  'Наименование организации': string;
}
