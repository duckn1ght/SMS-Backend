import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateWhitelistDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  phone: string;
  
  @IsString()
  @IsOptional()
  @ApiProperty()
  comment?: string;
}
