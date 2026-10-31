import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { AgeGroup, CatStatus } from '../enums';

export class AdminCatsQueryDto {
  @ApiPropertyOptional({
    description: 'Cerca per nom (parcial, sense distingir majúscules)',
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
      'kitten < 12 mesos, young 12-24 mesos, adult 2-7 anys, senior >= 7 anys',
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
