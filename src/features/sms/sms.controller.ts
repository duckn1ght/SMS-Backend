import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { SmsService } from './sms.service';
import { CheckSmsDto } from './dto/check-sms.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UniversalJwtGuard } from '../auth/guards/universal.guard';

@Controller('sms')
@ApiTags('SMS')
@ApiBearerAuth()
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('check')
  @UseGuards(UniversalJwtGuard)
  checkText(@Body() dto: CheckSmsDto) {
    return this.smsService.checkText(dto);
  }
}
