import { Module } from '@nestjs/common';
import { BlackListService } from './blacklist.service';
import { BlackListController } from './blacklist.controller';

@Module({
  controllers: [BlackListController],
  providers: [BlackListService],
})
export class BlackListModule {}
