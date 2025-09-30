import { ApiProperty } from '@nestjs/swagger';
import { SMS_TEMPLATE_STATUS } from '../../sms/types/sms-template-status.type';
import { IsString, IsEnum } from 'class-validator';

export class CreateSmsTemplateDto {
  @ApiProperty()
  @IsString()
  text: string;

  @ApiProperty()
  @IsEnum(SMS_TEMPLATE_STATUS)
  status: SMS_TEMPLATE_STATUS;
}
