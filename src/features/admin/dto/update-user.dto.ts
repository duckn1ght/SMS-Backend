import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { USER_ROLE } from 'src/features/user/types/user.types';

export class UpdateUserDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  organization?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(USER_ROLE)
  role?: USER_ROLE;

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  isActive?: boolean;
}
