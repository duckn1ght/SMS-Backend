import { IsEnum, IsNotEmpty } from 'class-validator';
import { APPEAL_STATUS } from '../types/appeal.type';
import { ApiProperty } from '@nestjs/swagger';

export class NewStatusAppealDto {
  @IsEnum(APPEAL_STATUS)
  @IsNotEmpty({ message: 'Поле status не может быть пустым' })
  @ApiProperty()
  status: APPEAL_STATUS;
}
