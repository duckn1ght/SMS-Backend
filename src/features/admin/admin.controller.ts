import { Body, Controller, Delete, Get, HttpCode, HttpException, Post, Req, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { WebJwtGuard } from '../auth/guards/web.guard';
import type { JwtReq } from '../auth/types/jwtReq.type';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateSmsBanWordDto } from './dto/create-sms-ban-word.dto';

@ApiBearerAuth()
@ApiTags('Админ Панель')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(WebJwtGuard)
  @HttpCode(201)
  @Post('create-user')
  createUser(@Req() r: JwtReq, @Body() dto: CreateUserDto) {
    if (!this.#isAdmin(r.user.role)) {
      throw new HttpException('Только у админа есть права для этого запроса', 403);
    }
    return this.adminService.createUser(dto, r);
  }

  @UseGuards(WebJwtGuard)
  @Get('users')
  getUser() {
    return this.adminService.getUsers();
  }

  @UseGuards(WebJwtGuard)
  @Get('sms-ban-words')
  getSmsBanWords() {
    return this.adminService.getBanWords();
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
  delete (@Req() r: JwtReq, @Body('id') id: string) {
    return this.adminService.removeBanWord(id, r);
  }

  /**
   * Проверяет, является ли указанная роль админской.
   *
   * Если роль не админская, то возвращает result = false и объект return для сообщения.
   * Если роль админская, то result = true.
   */
  #isAdmin(role: string) {
    return role === 'ADMIN';
  }
}
