import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { AdminCatsSort, AgeGroup, CatStatus, SortDirection } from '../../enums';

export class AdminCatsQueryDto {
  @ApiPropertyOptional({
    description: 'Search by name (partial, case-insensitive)',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: CatStatus })
  @IsOptional()
  @IsEnum(CatStatus)
  status?: CatStatus;

  @ApiPropertyOptional({
    enum: AgeGroup,
    description:
      'kitten: under 12 months, young: 12 to 24 months, adult: 2 to 7 years, senior: 7 years or more',
  })
  @IsOptional()
  @IsEnum(AgeGroup)
  ageGroup?: AgeGroup;

  @ApiPropertyOptional({
    enum: ['true', 'false'],
    description: 'true: only urgent cats. false or omitted: no restriction',
  })
  @IsOptional()
  @IsIn(['true', 'false'])
  isUrgent?: 'true' | 'false';

  @ApiPropertyOptional({
    enum: ['true', 'false'],
    description: 'true: only featured cats. false or omitted: no restriction',
  })
  @IsOptional()
  @IsIn(['true', 'false'])
  isFeatured?: 'true' | 'false';

  @ApiPropertyOptional({
    enum: AdminCatsSort,
    default: AdminCatsSort.ENTRY_DATE,
    description:
      'entryDate: entry date, name: alphabetical, age: youngest first when asc, status: available, in_foster, reserved, adopted when asc, visibility: visible first when asc',
  })
  @IsOptional()
  @IsEnum(AdminCatsSort)
  sort: AdminCatsSort = AdminCatsSort.ENTRY_DATE;

  @ApiPropertyOptional({
    enum: SortDirection,
    description:
      'Defaults to the natural direction of the sort: desc for entryDate, asc for the rest',
  })
  @IsOptional()
  @IsEnum(SortDirection)
  dir?: SortDirection;

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 50, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;
}
