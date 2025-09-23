import { IsEnum, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { APPEAL_TYPE } from '../types/appeal.type';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppealDto {
  @IsPhoneNumber()
  @IsOptional()
  @ApiProperty()
  phone?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  sum?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  who?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  howSendMoneny?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  communicationMethod?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  when?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  helpAsk?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  details?: string;

  @IsEnum(APPEAL_TYPE)
  @ApiProperty()
  @IsOptional()
  type?: APPEAL_TYPE;

  @ApiProperty()
  @IsString()
  @IsOptional()
  iin?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  fio?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  userPhone?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  region?: string;
}
