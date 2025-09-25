import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateWhitelistDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  organization: string;
}
