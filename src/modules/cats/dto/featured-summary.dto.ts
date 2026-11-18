import { ApiProperty } from '@nestjs/swagger';

export class FeaturedSummaryDto {
  @ApiProperty({
    description: 'Number of cats currently featured (available only)',
  })
  count: number;

  @ApiProperty({ description: 'Maximum number of featured cats' })
  max: number;
}
