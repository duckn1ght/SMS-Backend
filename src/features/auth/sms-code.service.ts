import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { randomInt } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
@Injectable()
export class SmsCodeService {
  private readonly CODE_TTL = 300; // 5 минут
  private readonly CODE_PREFIX = 'sms:verify:code:';

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  /** Генерирует и сохраняет код для номера телефона, возвращает код (для отправки через SMS-сервис) */
  async generateAndSaveCode(phone: string): Promise<string> {
    const code = this.#generateCode();
    const key = this.CODE_PREFIX + phone;
    await this.cacheManager.set(key, code, this.CODE_TTL);
    return code;
  }

  /** Проверяет код для номера телефона. Если успешно — удаляет код из Redis */
  async verifyCode(phone: string, code: string): Promise<boolean> {
    const key = this.CODE_PREFIX + phone;
    const savedCode = await this.cacheManager.get<string>(key);
    if (savedCode && savedCode === code) {
      await this.cacheManager.del(key);
      return true;
    }
    return false;
  }

  async sendSms(phone: string, code: string): Promise<void> {
    const apiKey = this.configService.getOrThrow<string>('SMS_TOKEN');
    const url = `https://api.mobizon.kz/service/message/sendSmsMessage?output=json&api=v1&apiKey=${apiKey}`;
    const data = new URLSearchParams({
      recipient: phone,
      text: `Ваш код для подтверждения регистрации в приложении Halyk Qorgan: ${code}`,
      'params[name]': 'Halyk Qorgan',
    });
    await firstValueFrom(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.httpService.post(url, data.toString(), {
        headers: {
          'cache-control': 'no-cache',
          'content-type': 'application/x-www-form-urlencoded',
        },
      }),
    );
  }

  /** Генерирует 4-значный код */
  #generateCode(): string {
    return randomInt(1000, 10000).toString();
  }
}
