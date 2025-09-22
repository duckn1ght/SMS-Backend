import { Module } from '@nestjs/common';
import { AppealService } from './appeal.service';
import { AppealController } from './appeal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appeal } from './entities/appeal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appeal])],
  controllers: [AppealController],
  providers: [AppealService],
})
export class AppealModule {}
