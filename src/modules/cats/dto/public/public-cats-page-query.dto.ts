import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  PUBLIC_CATS_DEFAULT_PAGE_SIZE,
  PUBLIC_CATS_MAX_PAGE_SIZE,
} from '../../constants/public-cats.constants';
import {
  AgeGroup,
  CatGender,
  CompatibleWith,
  PublicCatsSort,
} from '../../enums';

const toList = ({ value }: { value: unknown }) =>
  typeof value === 'string'
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : value;

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

  @ApiPropertyOptional({
    description: 'Comma-separated genders (any of them)',
    example: 'male,female',
  })
  @IsOptional()
  @Transform(toList)
  @IsEnum(CatGender, { each: true })
  gender?: CatGender[];

  @ApiPropertyOptional({
    description:
      'Comma-separated age groups (any of them): kitten, young, adult, senior',
    example: 'kitten,young',
  })
  @IsOptional()
  @Transform(toList)
  @IsEnum(AgeGroup, { each: true })
  ageGroup?: AgeGroup[];

  @ApiPropertyOptional({
    description:
      'Comma-separated targets the cat must be compatible with (all of them, only "yes" counts): cats, dogs, children',
    example: 'cats,children',
  })
  @IsOptional()
  @Transform(toList)
  @IsEnum(CompatibleWith, { each: true })
  compatible?: CompatibleWith[];

  @ApiPropertyOptional({
    description:
      'Comma-separated characteristic codes (the cat must have at least one)',
    example: 'affectionate,playful',
  })
  @IsOptional()
  @Transform(toList)
  @IsString({ each: true })
  traits?: string[];

  @ApiPropertyOptional({
    enum: ['true', 'false'],
    description: 'true: only urgent cats. false or omitted: no restriction',
  })
  @IsOptional()
  @IsIn(['true', 'false'])
  urgent?: 'true' | 'false';

  @ApiPropertyOptional({
    enum: ['true', 'false'],
    description:
      'true: only cats to be adopted together with another cat. false or omitted: no restriction',
  })
  @IsOptional()
  @IsIn(['true', 'false'])
  joint?: 'true' | 'false';

  @ApiPropertyOptional({
    maxLength: 50,
    description: 'Search by name (partial, case and accent insensitive)',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(50)
  search?: string;
}
