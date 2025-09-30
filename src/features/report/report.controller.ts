import { Controller, Get, Post, Param, Body, Req, UseGuards, Delete, HttpCode, Query } from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import type { JwtReq } from '../auth/types/jwtReq.type';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AndroidJwtGuard } from '../auth/guards/android.guard';
import { UniversalJwtGuard } from '../auth/guards/universal.guard';
import { WebJwtGuard } from '../auth/guards/web.guard';

@Controller('report')
@ApiTags('Жалобы')
@ApiBearerAuth()
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @UseGuards(UniversalJwtGuard)
  @HttpCode(201)
  async create(@Body() dto: CreateReportDto, @Req() req: JwtReq) {
    return this.reportService.create(dto, req);
  }

  @Get()
  @ApiQuery({ name: 'take', required: false })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'search', required: false, description: 'Поиск по fakeId или номеру создателя' })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'region', required: false })
  @ApiQuery({ name: 'orderBy', required: false })
  @ApiQuery({ name: 'orderDir', required: false })
  @UseGuards(WebJwtGuard)
  async findAll(
    @Query('take') take?: number,
    @Query('skip') skip?: number,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('region') region?: string,
    @Query('orderBy') orderBy?: string,
    @Query('orderDir') orderDir?: 'ASC' | 'DESC',
  ) {
    return this.reportService.findAll(take, skip, { search, role, region }, { orderBy, orderDir });
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
  @UseGuards(UniversalJwtGuard)
  async remove(@Param('id') id: string, @Req() r: JwtReq) {
    return await this.reportService.remove(id, r);
  }
}
