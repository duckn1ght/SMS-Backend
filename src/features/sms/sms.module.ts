import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { SmsController } from './sms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmsBanWord } from './entities/sms-ban-word.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SmsBanWord])],
  controllers: [SmsController],
  providers: [SmsService],
})
export class SmsModule {}
