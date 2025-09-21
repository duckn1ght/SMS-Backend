import { Module } from '@nestjs/common';
import { WhitelistService } from './whitelist.service';
import { WhitelistController } from './whitelist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Whitelist } from './entities/whitelist.entity';
import { User } from '../user/entities/user.entity';
import { Blacklist } from '../blacklist/entities/blacklist.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Whitelist, User, Blacklist])],
  controllers: [WhitelistController],
  providers: [WhitelistService],
})
export class WhiteListModule {}
