import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class PairedCatOptionsQueryDto {
  @ApiPropertyOptional({
    format: 'uuid',
    description:
      'Id of the cat being edited. Its current paired cat is included in the options.',
  })
  @IsOptional()
  @IsUUID()
  catId?: string;
}
