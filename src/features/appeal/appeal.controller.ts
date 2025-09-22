import { Controller, Post, Get, Param, Body, Delete, Patch, Query, UseGuards, Req } from '@nestjs/common';
import { AppealService } from './appeal.service';
import { CreateAppealDto } from './dto/create-appeal.dto';
import { NewStatusAppealDto } from './dto/new-status-appeal.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AndroidJwtGuard } from '../auth/guards/android.guard';
import { WebJwtGuard } from '../auth/guards/web.guard';
import { UniversalJwtGuard } from '../auth/guards/universal.guard';
import type { JwtReq } from '../auth/types/jwtReq.type';

@Controller('appeal')
@ApiTags('Обращения')
@ApiBearerAuth()
export class AppealController {
  constructor(private readonly appealService: AppealService) {}

  @Post()
  @UseGuards(AndroidJwtGuard)
  create(@Body() dto: CreateAppealDto) {
    return this.appealService.create(dto);
  }

  @Get()
  @UseGuards(WebJwtGuard)
  findAll() {
    return this.appealService.findAll();
  }

  @Get(':id')
  @UseGuards(UniversalJwtGuard)
  findOne(@Param('id') id: string) {
    return this.appealService.findOne(id);
  }

  @Get('user/:userId')
  @UseGuards(WebJwtGuard)
  findAllByUser(@Param('userId') userId: string) {
    return this.appealService.findAllByPhone(userId);
  }

  @Get('my')
  @UseGuards(WebJwtGuard)
  findMy(@Req() r: JwtReq) {
    return this.appealService.findAllByPhone(r.user.id);
  }

  /** Удалить обращение */
  @Delete(':id')
  @UseGuards(AndroidJwtGuard)
  remove(@Param('id') id: string) {
    return this.appealService.remove(id);
  }

  @Patch(':id/status')
  @UseGuards(WebJwtGuard)
  updateStatus(@Param('id') id: string, @Body() dto: NewStatusAppealDto) {
    return this.appealService.updateStatus(id, dto);
  }
}
