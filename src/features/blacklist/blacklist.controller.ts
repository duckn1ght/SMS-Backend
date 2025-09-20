import { Controller } from '@nestjs/common';
import { BlackListService } from './blacklist.service';

@Controller('black-list')
export class BlackListController {
  constructor(private readonly blackListService: BlackListService) {}
}
