import { ApiProperty } from '@nestjs/swagger';
import { Multer } from 'multer';

export class ImportDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Excel файл для загрузки',
  })
  file: Multer.File;
}
