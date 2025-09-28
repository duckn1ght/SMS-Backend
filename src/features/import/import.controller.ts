import { Controller, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ImportService } from './import.service';
import { Multer } from 'multer';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ImportDto } from './dto/import.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { JwtReq } from '../auth/types/jwtReq.type';
import { WebJwtGuard } from '../auth/guards/web.guard';

@Controller('import')
@ApiTags('Импорт')
@ApiBearerAuth()
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(WebJwtGuard)
  @ApiBody({
    type: ImportDto,
  })
  async importFromXlsx(@UploadedFile() file: Multer.File, @Req() r: JwtReq) {
    return await this.importService.importFromXlsx(file.buffer, r);
  }
}
