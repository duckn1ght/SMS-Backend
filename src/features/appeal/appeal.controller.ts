import { Controller } from '@nestjs/common';
import { AppealService } from './appeal.service';

@Controller('appeal')
export class AppealController {
  constructor(private readonly appealService: AppealService) {}
}
