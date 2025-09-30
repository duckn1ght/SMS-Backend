import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SMS_TEMPLATE_STATUS } from 'src/features/sms/types/sms-template-status.type';

export class UpdateSmsTemplateDto {
  @IsString()
  @ApiProperty()
  @IsOptional()
  text?: string;

  @IsEnum(SMS_TEMPLATE_STATUS)
  @IsOptional()
  @ApiProperty()
  status?: SMS_TEMPLATE_STATUS;
}
