import { Body, Controller, Delete, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { JwtReq } from '../auth/types/jwtReq.type';
import { UniversalJwtGuard } from '../auth/guards/universal.guard';
import { WebJwtGuard } from '../auth/guards/web.guard';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('profile')
@ApiTags('Профиль')
@ApiBearerAuth()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  @UseGuards(UniversalJwtGuard)
  async me(@Req() r: JwtReq) {
    return await this.profileService.findOneById(r.user.id);
  }

  // @Get(':id')
  // @UseGuards(WebJwtGuard)
  // async byId(@Param('id') id: string) {
  //   return await this.profileService.findOneById(id);
  // }

  @Delete()
  @UseGuards(UniversalJwtGuard)
  async delete(@Req() r: JwtReq) {
    return await this.profileService.delete(r);
  }

  @Patch(':id')
  @UseGuards(UniversalJwtGuard)
  async changePassword(@Body() dto: ChangePasswordDto, @Req() r: JwtReq) {
    return await this.profileService.changePassword(r, dto);
  }
}
