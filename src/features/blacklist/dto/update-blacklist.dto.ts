import { PartialType } from '@nestjs/swagger';
import { CreateWhitelistDto } from 'src/features/whitelist/dto/create-whitelist.dto';

export class UpdateBlacklistDto extends PartialType(CreateWhitelistDto) {}
