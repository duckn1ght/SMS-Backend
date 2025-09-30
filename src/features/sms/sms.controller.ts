import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { SmsService } from './sms.service';
import { CheckSmsDto } from './dto/check-sms.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UniversalJwtGuard } from '../auth/guards/universal.guard';
import type { JwtReq } from '../auth/types/jwtReq.type';

@Controller('sms')
@ApiTags('SMS')
@ApiBearerAuth()
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('check')
  @UseGuards(UniversalJwtGuard)
  checkText(@Body() dto: CheckSmsDto, @Req() r: JwtReq) {
    return this.smsService.checkText(dto, r);
  }
}
