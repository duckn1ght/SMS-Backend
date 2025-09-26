import { Controller, Get, Post } from '@nestjs/common';
import { SmsService } from './sms.service';
import { CheckSmsDto } from './dto/check-sms.dto';

@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('check')
  checkText(dto: CheckSmsDto) {
    return this.smsService.checkText(dto);
  }
}
