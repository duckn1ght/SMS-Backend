import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { ActionLogModule } from '../action-log/action-log.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), ActionLogModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
