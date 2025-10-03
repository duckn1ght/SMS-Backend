import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class ResendSmsDto {
  @ApiProperty({
    example: '+77012345678',
    description: 'Номер телефона для переотправки СМС кода',
  })
  @IsString()
  @Matches(/^\+7\d{10}$/, { message: 'Номер телефона должен быть в формате +7XXXXXXXXXX' })
  phone: string;
}
