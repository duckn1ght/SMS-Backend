import { Controller, Get, UseGuards, Res } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { WebJwtGuard } from '../auth/guards/web.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Статистика')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  @UseGuards(WebJwtGuard)
  getStatistics() {
    return this.statisticsService.getStatistics();
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
}
