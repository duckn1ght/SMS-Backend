import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { WebJwtGuard } from '../auth/guards/web.guard';
import type { JwtReq } from '../auth/types/jwtReq.type';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateSmsBanWordDto } from './dto/create-sms-ban-word.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiBearerAuth()
@ApiTags('Админ Панель')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(WebJwtGuard)
  @HttpCode(201)
  @Post('create-user')
  createUser(@Req() r: JwtReq, @Body() dto: CreateUserDto) {
    if (!(r.user.role === 'ADMIN')) throw new HttpException('Только у админа есть права для этого запроса', 403);
    return this.adminService.createUser(dto, r);
  }

  @UseGuards(WebJwtGuard)
  @Get('users')
  getUsers(@Query('take') take?: number, @Query('skip') skip?: number) {
    return this.adminService.getUsers(take, skip);
  }

  @UseGuards(WebJwtGuard)
  @Get('user/:id')
  getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @UseGuards(WebJwtGuard)
  @Patch('user/:id')
  updateUser(@Req() r: JwtReq, @Body() dto: UpdateUserDto, @Param('id') id: string) {
    if (!(r.user.role === 'ADMIN')) throw new HttpException('Только у админа есть права для этого запроса', 403);
    return this.adminService.updateUser(dto, id, r);
  }

  @UseGuards(WebJwtGuard)
  @Get('sms-ban-words')
  getSmsBanWords(@Query('take') take?: number, @Query('skip') skip?: number) {
    return this.adminService.getBanWords(take, skip);
  }

  @UseGuards(WebJwtGuard)
  @Get('logs')
  getLogs(@Query('take') take?: number, @Query('skip') skip?: number) {
    return this.adminService.getLogs(take, skip);
  }

  @UseGuards(WebJwtGuard)
  @HttpCode(201)
  @Post('sms-ban-words')
  createSmsBanWord(@Body() dto: CreateSmsBanWordDto, @Req() r: JwtReq) {
    return this.adminService.addBanWord(dto, r);
  }

  @UseGuards(WebJwtGuard)
  @HttpCode(204)
  @Delete('sms-ban-words/:id')
  delete(@Req() r: JwtReq, @Body('id') id: string) {
    return this.adminService.removeBanWord(id, r);
  }
}
