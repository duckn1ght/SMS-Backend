import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PhoneService } from './phone.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UniversalJwtGuard } from '../auth/guards/universal.guard';

@Controller('phone')
@ApiBearerAuth()
@ApiTags('Проверка номера')
export class PhoneController {
  constructor(private readonly phoneService: PhoneService) {}

  @Get(':phone')
  @UseGuards(UniversalJwtGuard)
  async check(@Param('phone') phone: string) {
    return this.phoneService.phoneCheck(phone);
  }
}
