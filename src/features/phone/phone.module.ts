import { Module } from '@nestjs/common';
import { PhoneService } from './phone.service';
import { PhoneController } from './phone.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blacklist } from '../blacklist/entities/blacklist.entity';
import { Whitelist } from '../whitelist/entities/whitelist.entity';
import { Report } from '../report/entities/report.entity';
import { Detection } from './entities/detection.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Whitelist, Blacklist, Report, Detection, User])],
  controllers: [PhoneController],
  providers: [PhoneService],
})
export class PhoneModule {}
