import { Controller, Get, UseGuards, Res, Query } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { WebJwtGuard } from '../auth/guards/web.guard';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Статистика')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  @UseGuards(WebJwtGuard)
  @ApiQuery({ name: 'startDate', required: false, description: 'Начальная дата (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Конечная дата (YYYY-MM-DD)' })
  @ApiQuery({ name: 'period', required: false, description: 'Период: day, week, month, year' })
  @ApiQuery({ name: 'region', required: false, description: 'Фильтр по региону' })
  @ApiQuery({ name: 'appealType', required: false, description: 'Тип обращения' })
  getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('period') period?: 'day' | 'week' | 'month' | 'year',
    @Query('region') region?: string,
    @Query('appealType') appealType?: string,
  ) {
    return this.statisticsService.getStatistics({ startDate, endDate, period, region, appealType });
  }

  @Get('xlsx')
  @UseGuards(WebJwtGuard)
  async getXlsxStatistic(@Res() res) {
    const buffer = await this.statisticsService.getXlsxStatistics();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="statistics_${Date.now()}.xlsx"`,
    });
    res.send(buffer);
  }

  @Get('pdf')
  @UseGuards(WebJwtGuard)
  async getPDFStatistic(@Res() res) {
    const buffer = await this.statisticsService.getPdfStatistics();
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="statistics_${Date.now()}.pdf"`,
    });
    res.send(buffer);
  }

  @Get('regions')
  @UseGuards(WebJwtGuard)
  async getAllRegions() {
    return this.statisticsService.getAllRegions();
  }
}
