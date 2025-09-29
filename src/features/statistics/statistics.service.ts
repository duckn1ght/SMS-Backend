import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blacklist } from '../blacklist/entities/blacklist.entity';
import { User } from '../user/entities/user.entity';
import { Whitelist } from '../whitelist/entities/whitelist.entity';
import { Appeal } from '../appeal/entities/appeal.entity';
import { Report } from '../report/entities/report.entity';
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
    private readonly statisticsGateway: StatisticsGateway,
  ) {}

  async getStatistics() {
    // 1. Количество обращений по статусам
    const appealsByStatus = await this.appealRepo
      .createQueryBuilder('appeal')
      .select('appeal.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('appeal.status')
      .getRawMany();

    // 2. Количество обращений по регионам (по city пользователя)
    const appealsByRegion = await this.appealRepo
      .createQueryBuilder('appeal')
      .leftJoin('appeal.createdUser', 'user')
      .select('user.region', 'region')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.region')
      .getRawMany();

    // 3. Количество номеров в ЧС/БС по группам пользователей
    const blacklistByGroup = await this.blacklistRepo
      .createQueryBuilder('bl')
      .leftJoin('bl.createdUser', 'user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    const whitelistByGroup = await this.whitelistRepo
      .createQueryBuilder('wl')
      .leftJoin('wl.createdUser', 'user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    // 4. Динамика изменений ЧС/БС за сутки, месяц
    const blacklistDay = await this.blacklistRepo
      .createQueryBuilder('bl')
      .where("bl.createdAt >= NOW() - INTERVAL '1 day'")
      .getCount();

    const blacklistMonth = await this.blacklistRepo
      .createQueryBuilder('bl')
      .where("bl.createdAt >= NOW() - INTERVAL '1 month'")
      .getCount();

    const whitelistDay = await this.whitelistRepo
      .createQueryBuilder('wl')
      .where("wl.createdAt >= NOW() - INTERVAL '1 day'")
      .getCount();

    const whitelistMonth = await this.whitelistRepo
      .createQueryBuilder('wl')
      .where("wl.createdAt >= NOW() - INTERVAL '1 month'")
      .getCount();

    return {
      appealsByStatus,
      appealsByRegion,
      blacklistByGroup,
      whitelistByGroup,
      blacklistDay,
      blacklistMonth,
      whitelistDay,
      whitelistMonth,
      activeUsers: this.statisticsGateway.activeUsers.size,
      // maliciousSmsCount,
      // maliciousCallsCount,
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
      const russianStatus = this.#fromAppealStatusToRussianString(row.status);
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
      const russianRole = this.#fromRoleToRussianString(row.role);
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
      const russianRole = this.#fromRoleToRussianString(row.role);
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
