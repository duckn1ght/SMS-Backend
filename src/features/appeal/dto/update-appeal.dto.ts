import { PartialType } from '@nestjs/swagger';
import { CreateAppealDto } from './create-appeal.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAppealDto extends PartialType(CreateAppealDto) {
    @IsOptional()
    @IsString()
    response?: string;
}
