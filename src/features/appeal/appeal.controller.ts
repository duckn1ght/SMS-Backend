import { Controller, Post, Get, Param, Body, Delete, Patch, Query, UseGuards, Req, HttpCode } from '@nestjs/common';
import { AppealService } from './appeal.service';
import { CreateAppealDto } from './dto/create-appeal.dto';
import { NewStatusAppealDto } from './dto/new-status-appeal.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AndroidJwtGuard } from '../auth/guards/android.guard';
import { WebJwtGuard } from '../auth/guards/web.guard';
import { UniversalJwtGuard } from '../auth/guards/universal.guard';
import type { JwtReq } from '../auth/types/jwtReq.type';
import { UpdateAppealDto } from './dto/update-appeal.dto';

@Controller('appeal')
@ApiTags('Обращения')
@ApiBearerAuth()
export class AppealController {
  constructor(private readonly appealService: AppealService) {}

  @Post()
  @HttpCode(201)
  @UseGuards(UniversalJwtGuard)
  create(@Body() dto: CreateAppealDto, @Req() r: JwtReq) {
    return this.appealService.create(dto, r);
  }

  @Get()
  @UseGuards(WebJwtGuard)
  findAll() {
    return this.appealService.findAll();
  }

  @Get('by-id:id')
  @UseGuards(UniversalJwtGuard)
  findOne(@Param('id') id: string) {
    return this.appealService.findOne(id);
  }

  @Get('by-user/:userId')
  @UseGuards(WebJwtGuard)
  findAllByUser(@Param('userId') userId: string) {
    return this.appealService.findAllByUser(userId);
  }

  @Get('my')
  @UseGuards(AndroidJwtGuard)
  findMy(@Req() r: JwtReq) {
    return this.appealService.findAllByUser(r.user.id);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(AndroidJwtGuard)
  remove(@Param('id') id: string, @Req() r: JwtReq) {
    return this.appealService.remove(id, r);
  }

  @Patch(':id')
  @UseGuards(AndroidJwtGuard)
  update(@Param('id') id: string, @Body() dto: UpdateAppealDto, @Req() r: JwtReq) {
    return this.appealService.update(id, dto, r);
  }

  @Patch(':id/status')
  @UseGuards(WebJwtGuard)
  updateStatus(@Param('id') id: string, @Body() dto: NewStatusAppealDto, @Req() r: JwtReq) {
    return this.appealService.updateStatus(id, dto, r);
  }
}
