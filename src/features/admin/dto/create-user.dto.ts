import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';
import { USER_ROLE } from 'src/features/user/types/user.types';

export class CreateUserDto {
  @ApiProperty()
  @IsPhoneNumber()
  @IsNotEmpty()
  phone: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(USER_ROLE)
  role: USER_ROLE;
}
