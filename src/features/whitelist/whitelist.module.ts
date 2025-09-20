import { Module } from '@nestjs/common';
import { WhiteListService } from './whitelist.service';
import { WhiteListController } from './whitelist.controller';

@Module({
  controllers: [WhiteListController],
  providers: [WhiteListService],
})
export class WhiteListModule {}
