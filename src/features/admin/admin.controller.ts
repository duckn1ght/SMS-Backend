import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
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
  @Post('create-user')
  createUser(@Req() r: JwtReq, @Body() dto: CreateUserDto) {
    const check = this.#isNotAdmin(r.user.role);
    if (check.result) {
      return check.return;
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
  @Post('sms-ban-words')
  createSmsBanWord(@Body() dto: CreateSmsBanWordDto, @Req() r: JwtReq) {
    return this.adminService.addBanWord(dto, r);
  }

  /**
   * Проверяет, является ли указанная роль админской.
   *
   * Если роль не админская, то возвращает result = false и объект return для сообщения.
   * Если роль админская, то result = true.
   */
  #isNotAdmin(role: string) {
    if (role !== 'ADMIN')
      return {
        result: true,
        return: {
          code: 403,
          message: 'Только у админа есть права для этого запроса',
        },
      };
    return { result: false };
  }
}
