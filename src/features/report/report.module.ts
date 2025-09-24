import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { User } from '../user/entities/user.entity';
import { Blacklist } from '../blacklist/entities/blacklist.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { ActionLogModule } from '../action-log/action-log.module';

@Module({
  imports: [TypeOrmModule.forFeature([Report, Blacklist, User]), ActionLogModule],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
