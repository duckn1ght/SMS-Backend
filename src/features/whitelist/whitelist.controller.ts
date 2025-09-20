import { Controller } from '@nestjs/common';
import { WhiteListService } from './whitelist.service';

@Controller('white-list')
export class WhiteListController {
  constructor(private readonly whiteListService: WhiteListService) {}

  
}
