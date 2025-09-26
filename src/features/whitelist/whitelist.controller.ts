import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  Delete,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { WhitelistService } from './whitelist.service';
import { CreateWhitelistDto } from './dto/create-whitelist.dto';
import { UpdateWhitelistDto } from './dto/update-whitelist.dto';
import type { JwtReq } from '../auth/types/jwtReq.type';
import { UniversalJwtGuard } from '../auth/guards/universal.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WebJwtGuard } from '../auth/guards/web.guard';

@Controller('whitelist')
@ApiBearerAuth()
@ApiTags('Белый список')
export class WhitelistController {
  constructor(private readonly whitelistService: WhitelistService) {}

  @Post()
  @UseGuards(WebJwtGuard)
  @HttpCode(201)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateWhitelistDto, @Req() req: JwtReq) {
    return this.whitelistService.create(dto, req.user.id);
  }

  @Get()
  @UseGuards(UniversalJwtGuard)
  async get() {
    return this.whitelistService.get();
  }

  @Get('by-phone/:phone')
  @UseGuards(UniversalJwtGuard)
  async getOneByNumber(@Param('phone') phone: string) {
    return this.whitelistService.getOneByNumber(phone);
  }

  @Get('orgs')
  @UseGuards(UniversalJwtGuard)
  async getOrgs() {
    return this.whitelistService.getOrgs();
  }

  @Get(':id')
  @UseGuards(UniversalJwtGuard)
  async getOneById(@Param('id') id: string) {
    return this.whitelistService.getOneById(id);
  }

  @Patch(':id')
  @UseGuards(WebJwtGuard)
  async update(@Body() dto: UpdateWhitelistDto, @Param('id') id: string) {
    return await this.whitelistService.update(dto, id);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(WebJwtGuard)
  async delete(@Param('id') id: string) {
    return await this.whitelistService.delete(id);
  }
}
