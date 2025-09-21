import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { BLACKLIST_STATUS } from '../types/blacklist.types';

export class UpdateBlacklistDto {
  @IsString()
  @IsOptional()
  @ApiProperty()
  comment?: string;

  @IsEnum(BLACKLIST_STATUS)
  @IsOptional()
  @ApiProperty()
  status?: BLACKLIST_STATUS;
}
