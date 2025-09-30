import { Controller, Post, Get, Param, Body, Delete, Patch, Query, UseGuards, Req, HttpCode } from '@nestjs/common';
import { AppealService } from './appeal.service';
import { CreateAppealDto } from './dto/create-appeal.dto';
import { ResponseStatusAppealDto } from './dto/response-status-appeal.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AndroidJwtGuard } from '../auth/guards/android.guard';
import { WebJwtGuard } from '../auth/guards/web.guard';
import { UniversalJwtGuard } from '../auth/guards/universal.guard';
import type { JwtReq } from '../auth/types/jwtReq.type';
import { UpdateAppealDto } from './dto/update-appeal.dto';
import { APPEAL_STATUS } from './types/appeal.type';
import { USER_ROLE } from '../user/types/user.types';

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
  @ApiQuery({ name: 'take', required: false })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'status', required: false, default: 'new' })
  @ApiQuery({ name: 'region', required: false, default: 'Павлодарская область' })
  @ApiQuery({ name: 'role', required: false, default: 'USER' })
  @ApiQuery({ name: 'orderBy', required: false, default: 'createdAt' })
  @ApiQuery({ name: 'orderDir', required: false, default: 'DESC' })
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('status') status?: APPEAL_STATUS,
    @Query('region') region?: string,
    @Query('role') role?: USER_ROLE,
    @Query('orderBy') orderBy?: string,
    @Query('orderDir') orderDir?: 'ASC' | 'DESC',
    @Query('fakeId') fakeId?: number,
  ) {
    return this.appealService.findAll(
      take,
      skip,
      {
        status: status, // если нужны строгие типы, можно добавить проверку
        region,
        role: role,
        fakeId,
      },
      { orderBy, orderDir },
    );
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
  updateStatus(@Param('id') id: string, @Body() dto: ResponseStatusAppealDto, @Req() r: JwtReq) {
    return this.appealService.response(id, dto, r);
  }
}
