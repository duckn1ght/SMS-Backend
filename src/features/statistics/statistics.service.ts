import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blacklist } from '../blacklist/entities/blacklist.entity';
import { User } from '../user/entities/user.entity';
import { Whitelist } from '../whitelist/entities/whitelist.entity';
import { Appeal } from '../appeal/entities/appeal.entity';
import { Report } from '../report/entities/report.entity';
import { Detection } from '../phone/entities/detection.entity';
import { StatisticsGateway } from './statistics.gateway';
import 'pdfkit-table';
import ExcelJS from 'exceljs';
import { USER_ROLE } from '../user/types/user.types';
import { APPEAL_STATUS } from '../appeal/types/appeal.type';
import { join } from 'node:path';
import { cwd } from 'node:process';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Report)
    private readonly reportRepo: Repository<Report>,
    @InjectRepository(Blacklist)
    private readonly blacklistRepo: Repository<Blacklist>,
    @InjectRepository(Whitelist)
    private readonly whitelistRepo: Repository<Whitelist>,
    @InjectRepository(Appeal)
    private readonly appealRepo: Repository<Appeal>,
    @InjectRepository(Detection)
    private readonly detectionRepo: Repository<Detection>,
    private readonly statisticsGateway: StatisticsGateway,
  ) {}

  async getStatistics(filters?: {
    startDate?: string;
    endDate?: string;
    period?: 'day' | 'week' | 'month' | 'year';
    region?: string;
    appealType?: string;
  }) {
    // Подготавливаем условия фильтрации
    const dateConditions = this.buildDateConditions(filters);
    const regionCondition = filters?.region ? `user.region = :region` : '';
    const appealTypeCondition = filters?.appealType ? `appeal.type = :appealType` : '';

    // 1. Количество обращений по статусам
    let appealsByStatusQuery = this.appealRepo
      .createQueryBuilder('appeal')
      .leftJoin('appeal.createdUser', 'user')
      .select('appeal.status', 'status')
      .addSelect('COUNT(*)', 'count');

    if (dateConditions) {
      appealsByStatusQuery = appealsByStatusQuery.where(dateConditions);
    }
    if (regionCondition) {
      appealsByStatusQuery = appealsByStatusQuery.andWhere(regionCondition, { region: filters?.region });
    }
    if (appealTypeCondition) {
      appealsByStatusQuery = appealsByStatusQuery.andWhere(appealTypeCondition, { appealType: filters?.appealType });
    }

    const appealsByStatus = await appealsByStatusQuery.groupBy('appeal.status').getRawMany();

    // 2. Количество обращений по регионам
    let appealsByRegionQuery = this.appealRepo
      .createQueryBuilder('appeal')
      .leftJoin('appeal.createdUser', 'user')
      .select('user.region', 'region')
      .addSelect('COUNT(*)', 'count');

    if (dateConditions) {
      appealsByRegionQuery = appealsByRegionQuery.where(dateConditions);
    }
    if (regionCondition) {
      appealsByRegionQuery = appealsByRegionQuery.andWhere(regionCondition, { region: filters?.region });
    }
    if (appealTypeCondition) {
      appealsByRegionQuery = appealsByRegionQuery.andWhere(appealTypeCondition, { appealType: filters?.appealType });
    }

    const appealsByRegion = await appealsByRegionQuery.groupBy('user.region').getRawMany();

    // 3. Количество номеров в ЧС/БС по группам пользователей
    let blacklistByGroupQuery = this.blacklistRepo
      .createQueryBuilder('bl')
      .leftJoin('bl.createdUser', 'user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count');

    if (dateConditions) {
      blacklistByGroupQuery = blacklistByGroupQuery.where(dateConditions.replace('appeal.', 'bl.'));
    }
    if (regionCondition) {
      blacklistByGroupQuery = blacklistByGroupQuery.andWhere(regionCondition, { region: filters?.region });
    }

    const blacklistByGroup = await blacklistByGroupQuery.groupBy('user.role').getRawMany();

    let whitelistByGroupQuery = this.whitelistRepo
      .createQueryBuilder('wl')
      .leftJoin('wl.createdUser', 'user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count');

    if (dateConditions) {
      whitelistByGroupQuery = whitelistByGroupQuery.where(dateConditions.replace('appeal.', 'wl.'));
    }
    if (regionCondition) {
      whitelistByGroupQuery = whitelistByGroupQuery.andWhere(regionCondition, { region: filters?.region });
    }

    const whitelistByGroup = await whitelistByGroupQuery.groupBy('user.role').getRawMany();

    // 4. Динамика изменений ЧС/БС с фильтрами
    let blacklistDayQuery = this.blacklistRepo.createQueryBuilder('bl').leftJoin('bl.createdUser', 'user');
    let blacklistMonthQuery = this.blacklistRepo.createQueryBuilder('bl').leftJoin('bl.createdUser', 'user');
    let whitelistDayQuery = this.whitelistRepo.createQueryBuilder('wl').leftJoin('wl.createdUser', 'user');
    let whitelistMonthQuery = this.whitelistRepo.createQueryBuilder('wl').leftJoin('wl.createdUser', 'user');

    // Применяем базовые временные фильтры или кастомные
    if (dateConditions) {
      blacklistDayQuery = blacklistDayQuery.where(dateConditions.replace('appeal.', 'bl.'));
      blacklistMonthQuery = blacklistMonthQuery.where(dateConditions.replace('appeal.', 'bl.'));
      whitelistDayQuery = whitelistDayQuery.where(dateConditions.replace('appeal.', 'wl.'));
      whitelistMonthQuery = whitelistMonthQuery.where(dateConditions.replace('appeal.', 'wl.'));
    } else {
      blacklistDayQuery = blacklistDayQuery.where("bl.createdAt >= NOW() - INTERVAL '1 day'");
      blacklistMonthQuery = blacklistMonthQuery.where("bl.createdAt >= NOW() - INTERVAL '1 month'");
      whitelistDayQuery = whitelistDayQuery.where("wl.createdAt >= NOW() - INTERVAL '1 day'");
      whitelistMonthQuery = whitelistMonthQuery.where("wl.createdAt >= NOW() - INTERVAL '1 month'");
    }

    // Применяем региональный фильтр
    if (regionCondition) {
      blacklistDayQuery = blacklistDayQuery.andWhere(regionCondition, { region: filters?.region });
      blacklistMonthQuery = blacklistMonthQuery.andWhere(regionCondition, { region: filters?.region });
      whitelistDayQuery = whitelistDayQuery.andWhere(regionCondition, { region: filters?.region });
      whitelistMonthQuery = whitelistMonthQuery.andWhere(regionCondition, { region: filters?.region });
    }

    const blacklistDay = await blacklistDayQuery.getCount();
    const blacklistMonth = await blacklistMonthQuery.getCount();
    const whitelistDay = await whitelistDayQuery.getCount();
    const whitelistMonth = await whitelistMonthQuery.getCount();

    // 5. Статистика по обнаружениям

    // Обнаруженные номера с фильтрацией
    let detectedPhonesQuery = this.detectionRepo
      .createQueryBuilder('detection')
      .leftJoin('detection.createdUser', 'user')
      .where("detection.type = 'phone'");

    // Обнаруженные SMS с фильтрацией
    let detectedSmsQuery = this.detectionRepo
      .createQueryBuilder('detection')
      .leftJoin('detection.createdUser', 'user')
      .where("detection.type = 'sms'");

    // Применяем фильтры по датам
    if (dateConditions) {
      const detectionDateCondition = dateConditions.replace('appeal.', 'detection.');
      detectedPhonesQuery = detectedPhonesQuery.andWhere(detectionDateCondition);
      detectedSmsQuery = detectedSmsQuery.andWhere(detectionDateCondition);
    }
    // Если фильтров по датам нет, берем все записи без ограничений по времени

    // Применяем фильтр по региону
    if (regionCondition) {
      detectedPhonesQuery = detectedPhonesQuery.andWhere(regionCondition, { region: filters?.region });
      detectedSmsQuery = detectedSmsQuery.andWhere(regionCondition, { region: filters?.region });
    }

    const detectedPhonesCount = await detectedPhonesQuery.getCount();
    const detectedSmsCount = await detectedSmsQuery.getCount();

    return {
      appealsByStatus,
      appealsByRegion,
      blacklistByGroup,
      whitelistByGroup,
      blacklistDay,
      blacklistMonth,
      whitelistDay,
      whitelistMonth,
      detectedPhonesCount,
      detectedSmsCount,
      activeUsers: this.statisticsGateway.activeUsers.size,
    };
  }

  async getPdfStatistics() {
    const stats = await this.getStatistics();
    const PDFDocument = (await import('pdfkit')).default || (await import('pdfkit'));
    const doc = new PDFDocument({ margin: 40 });
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    // Регистрируем кириллический шрифт
    const fontPath = join(cwd(), 'src/assets/fonts/DejaVuSans.ttf');
    doc.registerFont('Cyrillic', fontPath);

    // Шапка
    doc.font('Cyrillic').fontSize(16).text('Отчет по статистике платформы Halyk Qorgan', { align: 'center' });
    doc.moveDown(0.5);
    doc.font('Cyrillic').fontSize(12).text('Дата создания отчета:', { continued: true });
    doc.text(` ${new Date().toLocaleDateString('ru-RU')}`);
    doc.moveDown(1);

    // appealsByStatus
    doc.font('Cyrillic').fontSize(13).text('Обращения по статусу');
    doc.moveDown(0.3);
    stats.appealsByStatus.forEach((row: any) => {
      const russianStatus = this.#fromAppealStatusToRussianString(row.status);
      doc.font('Cyrillic').fontSize(12).text(`${russianStatus}:`, { continued: true });
      doc.text(` ${Number(row.count)}`, { align: 'right' });
    });
    doc.moveDown(0.7);

    // appealsByRegion
    doc.font('Cyrillic').fontSize(13).text('Обращения по регионам');
    doc.moveDown(0.3);
    stats.appealsByRegion.forEach((row: any) => {
      doc
        .font('Cyrillic')
        .fontSize(12)
        .text(`${row.region || 'Не указано'}:`, { continued: true });
      doc.text(` ${Number(row.count)}`, { align: 'right' });
    });
    doc.moveDown(0.7);

    // blacklistByGroup
    doc.font('Cyrillic').fontSize(13).text('Черный список по группам пользователей');
    doc.moveDown(0.3);
    stats.blacklistByGroup.forEach((row: any) => {
      const russianRole = this.#fromRoleToRussianString(row.role);
      doc.font('Cyrillic').fontSize(12).text(`${russianRole}:`, { continued: true });
      doc.text(` ${Number(row.count)}`, { align: 'right' });
    });
    doc.moveDown(0.7);

    // whitelistByGroup
    doc.font('Cyrillic').fontSize(13).text('Белый список по группам пользователей');
    doc.moveDown(0.3);
    stats.whitelistByGroup.forEach((row: any) => {
      const russianRole = this.#fromRoleToRussianString(row.role);
      doc.font('Cyrillic').fontSize(12).text(`${russianRole}:`, { continued: true });
      doc.text(` ${Number(row.count)}`, { align: 'right' });
    });
    doc.moveDown(0.7);

    // Другая статистика
    doc.font('Cyrillic').fontSize(13).text('Другая статистика');
    doc.moveDown(0.3);
    doc.font('Cyrillic').fontSize(12).text(`Добавлено номеров в Черный список за сутки:`, { continued: true });
    doc.text(` ${stats.blacklistDay}`, { align: 'right' });
    doc.font('Cyrillic').fontSize(12).text(`Добавлено номеров в Черный список за месяц:`, { continued: true });
    doc.text(` ${stats.blacklistMonth}`, { align: 'right' });
    doc.font('Cyrillic').fontSize(12).text(`Добавлено номеров в Белый список за сутки:`, { continued: true });
    doc.text(` ${stats.whitelistDay}`, { align: 'right' });
    doc.font('Cyrillic').fontSize(12).text(`Добавлено номеров в Белый список за месяц:`, { continued: true });
    doc.text(` ${stats.whitelistMonth}`, { align: 'right' });
    doc.font('Cyrillic').fontSize(12).text(`Обнаруженных вредоносных номеров:`, { continued: true });
    doc.text(` ${stats.detectedPhonesCount}`, { align: 'right' });
    doc.font('Cyrillic').fontSize(12).text(`Обнаруженных вредоносных SMS:`, { continued: true });
    doc.text(` ${stats.detectedSmsCount}`, { align: 'right' });
    doc.font('Cyrillic').fontSize(12).text(`Активных пользователей на момент создания отчета:`, { continued: true });
    doc.text(` ${stats.activeUsers}`, { align: 'right' });

    doc.end();
    return await new Promise<Buffer>((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
    });
  }

  async getXlsxStatistics() {
    const stats = await this.getStatistics();
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Статистика');

    // Шапка
    sheet.mergeCells('A1:B1');
    sheet.getCell('A1').value = 'Отчет по статистике платформы Halyk Qorgan';
    sheet.getCell('A1').font = { bold: true, size: 14 };
    sheet.getCell('A1').alignment = { horizontal: 'center' };

    sheet.getCell('A2').value = 'Дата создания отчета:';
    sheet.getCell('A2').font = { bold: true };
    sheet.getCell('B2').value = new Date().toLocaleDateString('ru-RU');
    sheet.getCell('B2').alignment = { horizontal: 'right' };

    let rowIdx = 4;

    // appealsByStatus
    sheet.mergeCells(`A${rowIdx}:B${rowIdx}`);
    sheet.getCell(`A${rowIdx}`).value = 'Обращения по статусу';
    sheet.getCell(`A${rowIdx}`).alignment = { horizontal: 'center' };
    sheet.getCell(`A${rowIdx}`).font = { bold: true };
    rowIdx++;
    stats.appealsByStatus.forEach((row: any) => {
      const russianStatus = this.#fromAppealStatusToRussianString(row.status as APPEAL_STATUS);
      sheet.getCell(`A${rowIdx}`).value = russianStatus;
      sheet.getCell(`B${rowIdx}`).value = Number(row.count);
      sheet.getCell(`B${rowIdx}`).alignment = { horizontal: 'right' };
      rowIdx++;
    });
    rowIdx++;

    // appealsByRegion
    sheet.mergeCells(`A${rowIdx}:B${rowIdx}`);
    sheet.getCell(`A${rowIdx}`).value = 'Обращения по регионам';
    sheet.getCell(`A${rowIdx}`).alignment = { horizontal: 'center' };
    sheet.getCell(`A${rowIdx}`).font = { bold: true };
    rowIdx++;
    stats.appealsByRegion.forEach((row: any) => {
      sheet.getCell(`A${rowIdx}`).value = row.region || 'Не указано';
      sheet.getCell(`B${rowIdx}`).value = Number(row.count);
      sheet.getCell(`B${rowIdx}`).alignment = { horizontal: 'right' };
      rowIdx++;
    });
    rowIdx++;

    // blacklistByGroup
    sheet.mergeCells(`A${rowIdx}:B${rowIdx}`);
    sheet.getCell(`A${rowIdx}`).value = 'Черный список по группам пользователей';
    sheet.getCell(`A${rowIdx}`).font = { bold: true };
    sheet.getCell(`A${rowIdx}`).alignment = { horizontal: 'center' };
    rowIdx++;
    stats.blacklistByGroup.forEach((row: any) => {
      const russianRole = this.#fromRoleToRussianString(row.role as USER_ROLE);
      sheet.getCell(`A${rowIdx}`).value = russianRole;
      sheet.getCell(`B${rowIdx}`).value = Number(row.count);
      sheet.getCell(`B${rowIdx}`).alignment = { horizontal: 'right' };
      rowIdx++;
    });
    rowIdx++;

    // whitelistByGroup
    sheet.mergeCells(`A${rowIdx}:B${rowIdx}`);
    sheet.getCell(`A${rowIdx}`).value = 'Белый список по группам пользователей';
    sheet.getCell(`A${rowIdx}`).font = { bold: true };
    sheet.getCell(`A${rowIdx}`).alignment = { horizontal: 'center' };

    rowIdx++;
    stats.whitelistByGroup.forEach((row: any) => {
      const russianRole = this.#fromRoleToRussianString(row.role as USER_ROLE);
      sheet.getCell(`A${rowIdx}`).value = russianRole;
      sheet.getCell(`B${rowIdx}`).value = Number(row.count);
      sheet.getCell(`B${rowIdx}`).alignment = { horizontal: 'right' };
      rowIdx++;
    });
    rowIdx++;

    sheet.mergeCells(`A${rowIdx}:B${rowIdx}`);
    sheet.getCell(`A${rowIdx}`).value = 'Другая статистика';
    sheet.getCell(`A${rowIdx}`).font = { bold: true };
    sheet.getCell(`A${rowIdx}`).alignment = { horizontal: 'center' };
    rowIdx++;

    // blacklistDay, blacklistMonth
    sheet.getCell(`A${rowIdx}`).value = 'Добавлено номеров в Черный список за сутки';
    sheet.getCell(`B${rowIdx}`).value = stats.blacklistDay;
    sheet.getCell(`B${rowIdx}`).alignment = { horizontal: 'right' };

    rowIdx++;
    sheet.getCell(`A${rowIdx}`).value = 'Добавлено номеров в Черный список за месяц';
    sheet.getCell(`B${rowIdx}`).value = stats.blacklistMonth;
    sheet.getCell(`B${rowIdx}`).alignment = { horizontal: 'right' };
    rowIdx++;

    // whitelistDay, whitelistMonth
    sheet.getCell(`A${rowIdx}`).value = 'Добавлено номеров в Белый список за сутки';
    sheet.getCell(`B${rowIdx}`).value = stats.whitelistDay;
    sheet.getCell(`B${rowIdx}`).alignment = { horizontal: 'right' };
    rowIdx++;
    sheet.getCell(`A${rowIdx}`).value = 'Добавлено номеров в Белый список за месяц';
    sheet.getCell(`B${rowIdx}`).value = stats.whitelistMonth;
    sheet.getCell(`B${rowIdx}`).alignment = { horizontal: 'right' };
    rowIdx++;

    // detections
    sheet.getCell(`A${rowIdx}`).value = 'Обнаруженных вредоносных номеров';
    sheet.getCell(`B${rowIdx}`).value = stats.detectedPhonesCount;
    sheet.getCell(`B${rowIdx}`).alignment = { horizontal: 'right' };
    rowIdx++;
    sheet.getCell(`A${rowIdx}`).value = 'Обнаруженных вредоносных SMS';
    sheet.getCell(`B${rowIdx}`).value = stats.detectedSmsCount;
    sheet.getCell(`B${rowIdx}`).alignment = { horizontal: 'right' };
    rowIdx++;

    // activeUsers
    sheet.getCell(`A${rowIdx}`).value = 'Активных пользователей на момент создания отчета';
    sheet.getCell(`B${rowIdx}`).value = stats.activeUsers;
    sheet.getCell(`B${rowIdx}`).alignment = { horizontal: 'right' };

    // Автоширина столбцов
    sheet.columns = [
      { key: 'A', width: 50 },
      { key: 'B', width: 10 },
    ];

    // Получаем буфер Excel-файла
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  async getAllRegions() {
    const regions = await this.userRepo
      .createQueryBuilder('user')
      .select('DISTINCT user.region', 'region')
      .where('user.region IS NOT NULL')
      .getRawMany();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return regions.map((r) => r.region);
  }

  #fromRoleToRussianString(role: USER_ROLE): string {
    switch (role) {
      case USER_ROLE.ADMIN:
        return 'Админ';
      case USER_ROLE.PARTNER:
        return 'Партнер';
      case USER_ROLE.EXECUTOR:
        return 'Исполнитель';
      case USER_ROLE.USER:
        return 'Пользователь';
      case USER_ROLE.MODERATOR:
        return 'Модератор';
    }
  }

  private buildDateConditions(filters?: {
    startDate?: string;
    endDate?: string;
    period?: 'day' | 'week' | 'month' | 'year';
  }): string | null {
    if (filters?.startDate && filters?.endDate) {
      return `appeal.createdAt BETWEEN '${filters.startDate}' AND '${filters.endDate}'`;
    }

    if (filters?.period) {
      switch (filters.period) {
        case 'day':
          return "appeal.createdAt >= NOW() - INTERVAL '1 day'";
        case 'week':
          return "appeal.createdAt >= NOW() - INTERVAL '1 week'";
        case 'month':
          return "appeal.createdAt >= NOW() - INTERVAL '1 month'";
        case 'year':
          return "appeal.createdAt >= NOW() - INTERVAL '1 year'";
      }
    }

    return null;
  }

  #fromAppealStatusToRussianString(status: APPEAL_STATUS): string {
    switch (status) {
      case APPEAL_STATUS.NEW:
        return 'Новое';
      case APPEAL_STATUS.IN_PROCESS:
        return 'В процессе';
      case APPEAL_STATUS.DONE:
        return 'Завершено';
      case APPEAL_STATUS.BLOCKED:
        return 'Заблокировано';
    }
  }
}
