import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegDto } from './dto/reg.dto';
import { AuthDto } from './dto/auth.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { ConfirmSmsDto } from './dto/confirm-sms.dto';
import { ResendSmsDto } from './dto/resend-sms.dto';

@Controller('auth')
@ApiTags('Авторизация и Регистрация')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async auth(@Body() dto: AuthDto) {
    return this.authService.auth(dto);
  }

  @Post('register')
  @HttpCode(201)
  @ApiBody({ type: RegDto })
  async register(@Body() dto: RegDto) {
    return this.authService.registration(dto);
  }

  @Post('confirm')
  async confirmSms(@Body() dto: ConfirmSmsDto) {
    return this.authService.confirmSms(dto.phone, dto.code);
  }

  @Post('resend')
  @HttpCode(200)
  @ApiBody({ type: ResendSmsDto })
  async resendSmsCode(@Body() dto: ResendSmsDto) {
    return this.authService.resendSmsCode(dto.phone);
  }

  @Get('check/:phone')
  async checkPhone(@Param('phone') phone: string) {
    return this.authService.checkReg(phone);
  }

  // @ApiBearerAuth()
  // @Get('me')
  // @UseGuards(UniversalJwtGuard)
  // async me(@Req() r: JwtReq) {
  //   return this.authService.me(r.user.id);
  // }
}
