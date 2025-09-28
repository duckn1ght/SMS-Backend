import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegDto } from './dto/reg.dto';
import { AuthDto } from './dto/auth.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import type { JwtReq } from './types/jwtReq.type';
import { UniversalJwtGuard } from './guards/universal.guard';

@Controller('auth')
@ApiTags('Авторизация и Регистрация')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async auth(@Body() dto: AuthDto) {
    return this.authService.auth(dto);
  }

  @Post('register')
  @HttpCode(201)
  @ApiBody({ type: RegDto })
  async register(@Body() dto: RegDto) {
    return this.authService.registration(dto);
  }

  // @ApiBearerAuth()
  // @Get('me')
  // @UseGuards(UniversalJwtGuard)
  // async me(@Req() r: JwtReq) {
  //   return this.authService.me(r.user.id);
  // }
}
