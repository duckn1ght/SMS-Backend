import { Module } from '@nestjs/common';
import { ActionLogService } from './action-log.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { ActionLog } from './entities/action-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, ActionLog])],
  providers: [ActionLogService],
  exports: [ActionLogService],
})
export class ActionLogModule {}
