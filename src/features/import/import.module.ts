import { Logger, Module } from '@nestjs/common';
import { ImportService } from './import.service';
import { ImportController } from './import.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Whitelist } from '../whitelist/entities/whitelist.entity';
import { Blacklist } from '../blacklist/entities/blacklist.entity';
import { ActionLogModule } from '../action-log/action-log.module';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Whitelist, Blacklist, User]), ActionLogModule],
  controllers: [ImportController],
  providers: [ImportService, Logger],
})
export class ImportModule {}
