import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { JwtReq } from '../auth/types/jwtReq.type';
import { UniversalJwtGuard } from '../auth/guards/universal.guard';
import { WebJwtGuard } from '../auth/guards/web.guard';

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

  @Get(':id')
  @UseGuards(WebJwtGuard)
  async byId(@Param('id') id: string) {
    return await this.profileService.findOneById(id);
  }
}
