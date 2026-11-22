import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';
import { MAX_FEATURED_CATS } from '../../constants/featured-cats.constants';
import { PUBLIC_CATS_MAX_LIMIT } from '../../constants/public-cats.constants';

export class PublicCatsQueryDto {
  @ApiPropertyOptional({
    description: `true: only the cats featured on the home page (available ones, at most ${MAX_FEATURED_CATS})`,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: PUBLIC_CATS_MAX_LIMIT,
    description:
      'Maximum number of cats. With featured=true it never exceeds the featured maximum.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(PUBLIC_CATS_MAX_LIMIT)
  limit?: number;
}
