import { Controller, Get, Param, Req } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ApiTags } from '@nestjs/swagger';
import type { JwtReq } from '../auth/types/jwtReq.type';

@Controller('profile')
@ApiTags('Профиль')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  async me(@Req() r: JwtReq) {
    return await this.profileService.findOneById(r.user.id);
  }

  @Get(':id')
  async byId(@Param('id') id: string) {
    return await this.profileService.findOneById(id);
  }
}
