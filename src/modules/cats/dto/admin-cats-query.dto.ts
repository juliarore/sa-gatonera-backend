import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { AgeGroup, CatStatus } from '../enums';

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
