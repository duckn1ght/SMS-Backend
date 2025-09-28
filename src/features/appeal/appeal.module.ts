import { Module } from '@nestjs/common';
import { AppealService } from './appeal.service';
import { AppealController } from './appeal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appeal } from './entities/appeal.entity';
import { ActionLogModule } from '../action-log/action-log.module';
import { User } from '../user/entities/user.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([Appeal, User]), ActionLogModule, NotificationModule],
  controllers: [AppealController],
  providers: [AppealService],
})
export class AppealModule {}
