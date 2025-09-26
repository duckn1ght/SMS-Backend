import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckSmsDto } from './dto/check-sms.dto';
import { SmsBanWord } from './entities/sms-ban-word.entity';

@Injectable()
export class SmsService {
  constructor(
    @InjectRepository(SmsBanWord)
    private readonly banWordRepo: Repository<SmsBanWord>,
  ) {}

  async checkText(dto: CheckSmsDto) {
    const banWords = await this.banWordRepo.find();
    const text = dto.text.toLowerCase();
    const found = banWords.some((bw) => text.includes(bw.word.toLowerCase()));
    return { result: found };
  }
}
