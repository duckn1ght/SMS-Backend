import { Controller, Post, Get, Param, Body, Delete, Patch, Query, UseGuards, Req, HttpCode } from '@nestjs/common';
import { AppealService } from './appeal.service';
import { CreateAppealDto } from './dto/create-appeal.dto';
import { NewStatusAppealDto } from './dto/new-status-appeal.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
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
  @ApiQuery({
    name: 'take',
    required: false,
  })
  @ApiQuery({
    name: 'skip',
    required: false,
  })
  findAll(@Query('skip') skip?: number, @Query('take') take?: number) {
    return this.appealService.findAll(take, skip);
  }

  @Get('by-id/:id')
  @UseGuards(UniversalJwtGuard)
  findOne(@Param('id') id: string) {
    return this.appealService.findOne(id);
  }

  @Get('by-user/:userId')
  @UseGuards(WebJwtGuard)
  findAllByUser(@Param('userId') userId: string, @Query('skip') skip?: number, @Query('take') take?: number) {
    return this.appealService.findAllByUser(userId, take, skip);
  }

  @Get('my')
  @UseGuards(AndroidJwtGuard)
  findMy(@Req() r: JwtReq, @Query('skip') skip?: number, @Query('take') take?: number) {
    return this.appealService.findAllByUser(r.user.id, take, skip);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(UniversalJwtGuard)
  remove(@Param('id') id: string, @Req() r: JwtReq) {
    return this.appealService.remove(id, r);
  }

  @Patch(':id')
  @UseGuards(UniversalJwtGuard)
  update(@Param('id') id: string, @Body() dto: UpdateAppealDto, @Req() r: JwtReq) {
    return this.appealService.update(id, dto, r);
  }

  @Patch(':id/status')
  @UseGuards(WebJwtGuard)
  updateStatus(@Param('id') id: string, @Body() dto: NewStatusAppealDto, @Req() r: JwtReq) {
    return this.appealService.updateStatus(id, dto, r);
  }
}
