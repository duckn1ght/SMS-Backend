import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Report } from '../report/entities/report.entity';
import { Blacklist } from '../blacklist/entities/blacklist.entity';
import { Whitelist } from '../whitelist/entities/whitelist.entity';
import { Appeal } from '../appeal/entities/appeal.entity';
import { StatisticsGateway } from './statistics.gateway';
import { Detection } from '../phone/entities/detection.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Report, Blacklist, Whitelist, Appeal, Detection])],
  controllers: [StatisticsController],
  providers: [StatisticsService, StatisticsGateway],
})
export class StatisticsModule {}
