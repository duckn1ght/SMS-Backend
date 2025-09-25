import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WebJwtGuard } from '../auth/guards/web.guard';

@Controller('user')
@ApiBearerAuth()
@ApiTags('Пользователи')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('partners')
  @UseGuards(WebJwtGuard)
  getOrganizations() {
    return this.userService.getPartners();
  }
}
