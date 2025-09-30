import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckSmsDto } from './dto/check-sms.dto';
import { SmsBanWord } from './entities/sms-ban-word.entity';
import { Detection } from '../phone/entities/detection.entity';
import { JwtReq } from '../auth/types/jwtReq.type';
import { User } from '../user/entities/user.entity';
import { DETECTION_TYPE } from '../phone/types/detection.type';

@Injectable()
export class SmsService {
  constructor(
    @InjectRepository(SmsBanWord)
    private readonly banWordRepo: Repository<SmsBanWord>,
    @InjectRepository(Detection)
    private readonly detectionRepo: Repository<Detection>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async checkText(dto: CheckSmsDto, r: JwtReq) {
    const banWords = await this.banWordRepo.find();
    const text = dto.text.toLowerCase();
    const found = banWords.some((bw) => text.includes(bw.word.toLowerCase()));
    if (found) {
      const user = await this.userRepo.findOne({ where: { id: r.user.id } });
      if (!user) throw new HttpException('Пользователь по токену не найден', 403);
      await this.detectionRepo.save({
        type: DETECTION_TYPE.SMS,
        createdUser: user,
      });
    }
    return { result: found };
  }
}
