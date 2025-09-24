import { ApiBody, ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { CLIENT_TYPE } from 'src/features/user/types/user.types';

export class AuthDto {
  @IsOptional()
  @ApiProperty()
  @IsPhoneNumber(undefined, { message: 'Неверный формат номера' })
  phone?: string;

  @IsOptional()
  @ApiProperty()
  @IsEmail({}, { message: 'Неверный формат электронной почты' })
  email?: string;

  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsEnum(CLIENT_TYPE)
  clientType: CLIENT_TYPE;
}
