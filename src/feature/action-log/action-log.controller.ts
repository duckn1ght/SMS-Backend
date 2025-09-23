import { Controller } from '@nestjs/common';
import { ActionLogService } from './action-log.service';

@Controller('action-log')
export class ActionLogController {
  constructor(private readonly actionLogService: ActionLogService) {}
}
