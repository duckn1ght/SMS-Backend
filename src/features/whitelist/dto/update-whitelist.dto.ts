import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class UpdateWhitelistDto {
  @IsString()
  @IsOptional()
  @ApiProperty()
  organization: string;

  @IsPhoneNumber()
  @IsOptional()
  @ApiProperty()
  phone: string;
}
