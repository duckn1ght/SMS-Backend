import { IsEnum, IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';
import { APPEAL_TYPE } from '../types/appeal.type';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppealDto {
  @IsPhoneNumber()
  @IsNotEmpty()
  @ApiProperty()
  phone: string;

  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  text: string;

  @IsEnum(APPEAL_TYPE)
  @ApiProperty()
  @IsNotEmpty()
  type: APPEAL_TYPE;
}
