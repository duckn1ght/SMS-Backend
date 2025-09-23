import { Module } from '@nestjs/common';
import { BlacklistController } from './blacklist.controller';
import { BlacklistService } from './blacklist.service';
import { Blacklist } from './entities/blacklist.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Whitelist } from '../whitelist/entities/whitelist.entity';
import { ActionLogModule } from '../action-log/action-log.module';

@Module({
  imports: [TypeOrmModule.forFeature([Blacklist, User, Whitelist]), ActionLogModule],
  controllers: [BlacklistController],
  providers: [BlacklistService],
})
export class BlacklistModule {}
