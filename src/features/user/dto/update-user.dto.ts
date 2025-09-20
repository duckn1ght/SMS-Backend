import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from '../../admin/dto/create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
