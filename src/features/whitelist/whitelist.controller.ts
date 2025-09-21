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
} from '@nestjs/common';
import { WhitelistService } from './whitelist.service';
import { CreateWhitelistDto } from './dto/create-whitelist.dto';
import { UpdateWhitelistDto } from './dto/update-whitelist.dto';
import type { JwtReq } from '../auth/types/jwtReq.type';

@Controller('whitelist')
export class WhitelistController {
  constructor(private readonly whitelistService: WhitelistService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateWhitelistDto, @Req() req: JwtReq) {
    return this.whitelistService.create(dto, req.user.id);
  }

  @Get()
  async get() {
    return this.whitelistService.get();
  }

  @Get('by-phone/:phone')
  async getOneByNumber(@Param('phone') phone: string) {
    return this.whitelistService.getOneByNumber(phone);
  }

  @Get(':id')
  async getOneById(@Param('id') id: string) {
    return this.whitelistService.getOneById(id);
  }

  @Patch(':id')
  async update(@Body() dto: UpdateWhitelistDto, @Param('id') id: string) {
    return this.whitelistService.update(dto, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.whitelistService.delete(id);
    return;
  }
}
