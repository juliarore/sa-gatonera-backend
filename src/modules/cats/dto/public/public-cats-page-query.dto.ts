import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import {
  PUBLIC_CATS_DEFAULT_PAGE_SIZE,
  PUBLIC_CATS_MAX_PAGE_SIZE,
} from '../../constants/public-cats.constants';
import { PublicCatsSort } from '../../enums';

export class PublicCatsPageQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: PUBLIC_CATS_MAX_PAGE_SIZE,
    default: PUBLIC_CATS_DEFAULT_PAGE_SIZE,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(PUBLIC_CATS_MAX_PAGE_SIZE)
  pageSize: number = PUBLIC_CATS_DEFAULT_PAGE_SIZE;

  @ApiPropertyOptional({
    enum: PublicCatsSort,
    default: PublicCatsSort.OLDEST,
    description:
      'oldest: longest in the shelter first, recent: newest entry first, urgent: urgent cats first and then longest in the shelter, age-asc: youngest first, age-desc: oldest first, name: A-Z, name-desc: Z-A',
  })
  @IsOptional()
  @IsEnum(PublicCatsSort)
  sort: PublicCatsSort = PublicCatsSort.OLDEST;
}
