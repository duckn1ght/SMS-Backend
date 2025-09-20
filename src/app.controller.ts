import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Проверка работы приложения')
export class AppController {

  @Get('ping')
  ping() {
    return 'pong';
  }
}
