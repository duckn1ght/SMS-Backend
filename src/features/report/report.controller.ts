import { Controller, Get, Post, Param, Body, Req, UseGuards, Delete, HttpCode, Query } from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import type { JwtReq } from '../auth/types/jwtReq.type';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AndroidJwtGuard } from '../auth/guards/android.guard';
import { UniversalJwtGuard } from '../auth/guards/universal.guard';
import { WebJwtGuard } from '../auth/guards/web.guard';

@Controller('report')
@ApiTags('Жалобы')
@ApiBearerAuth()
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @UseGuards(AndroidJwtGuard)
  @HttpCode(201)
  async create(@Body() dto: CreateReportDto, @Req() req: JwtReq) {
    return this.reportService.create(dto, req);
  }

  @Get()
  @UseGuards(WebJwtGuard)
  async findAll(@Query('take') take?: number, @Query('skip') skip?: number) {
    return this.reportService.findAll(take, skip);
  }

  @Get('my')
  @UseGuards(AndroidJwtGuard)
  async findMy(@Req() req: JwtReq) {
    return this.reportService.findByUser(req.user.id);
  }

  @Get(':id')
  @UseGuards(UniversalJwtGuard)
  async findById(@Param('id') id: string) {
    return this.reportService.findById(id);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(AndroidJwtGuard)
  async remove(@Param() id: string, @Req() r: JwtReq) {
    await this.reportService.remove(id, r);
  }
}
