import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { WebJwtGuard } from '../auth/guards/web.guard';
import type { JwtReq } from '../auth/types/jwtReq.type';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';

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
    return this.adminService.createUser(dto);
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
