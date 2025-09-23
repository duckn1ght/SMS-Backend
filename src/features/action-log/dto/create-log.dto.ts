import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ACTION_LOG_TYPE } from '../types/action-log.type';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLogDto {
  @IsEnum(ACTION_LOG_TYPE)
  @IsNotEmpty()
  @ApiProperty()
  type: ACTION_LOG_TYPE;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  message: string;
}
