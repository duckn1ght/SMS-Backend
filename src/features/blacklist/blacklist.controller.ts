import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { BlacklistService } from './blacklist.service';
import { CreateBlacklistDto } from './dto/create-blacklist.dto';
import { UpdateBlacklistDto } from './dto/update-blacklist.dto';
import type { JwtReq } from '../auth/types/jwtReq.type';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WebJwtGuard } from '../auth/guards/web.guard';
import { UniversalJwtGuard } from '../auth/guards/universal.guard';

@Controller('blacklist')
@ApiBearerAuth()
@ApiTags('Черный список')
export class BlacklistController {
  constructor(private readonly blacklistService: BlacklistService) {}

  @Post()
  @UseGuards(WebJwtGuard)
  @HttpCode(201)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateBlacklistDto, @Req() req: JwtReq) {
    return this.blacklistService.create(dto, req);
  }

  @Get()
  @UseGuards(UniversalJwtGuard)
  async get() {
    return this.blacklistService.get();
  }

  @Get('by-phone/:phone')
  @UseGuards(UniversalJwtGuard)
  async getOneByNumber(@Param('phone') phone: string) {
    return this.blacklistService.getOneByNumber(phone);
  }

  @Get(':id')
  @UseGuards(UniversalJwtGuard)
  async getOneById(@Param('id') id: string) {
    return this.blacklistService.getOneById(id);
  }

  @Patch(':id')
  @UseGuards(WebJwtGuard)
  async update(@Body() dto: UpdateBlacklistDto, @Param('id') id: string, @Req() r: JwtReq) {
    return this.blacklistService.update(dto, id, r);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(WebJwtGuard)
  async delete(@Param('id') id: string, @Req() r: JwtReq) {
    return await this.blacklistService.delete(id, r);
  }
}
