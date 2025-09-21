import { Module } from '@nestjs/common';
import { PhoneService } from './phone.service';
import { PhoneController } from './phone.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blacklist } from '../blacklist/entities/blacklist.entity';
import { Whitelist } from '../whitelist/entities/whitelist.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Whitelist, Blacklist])],
  controllers: [PhoneController],
  providers: [PhoneService],
})
export class PhoneModule {}
