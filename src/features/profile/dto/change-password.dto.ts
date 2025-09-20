import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsSemVer, IsString } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  oldPassword: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  newPassword: string;
}
