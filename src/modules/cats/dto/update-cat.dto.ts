import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { ActivityLevel, CatGender, CatStatus, Compatibility } from '../enums';

const NAME_PATTERN = /^[\p{L}][\p{L}\s.'’-]*$/u;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function WhenPresent(): PropertyDecorator {
  return ValidateIf((_object, value) => value !== undefined);
}

function Trim(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );
}

export class UpdateCatDto {
  @ApiPropertyOptional({ maxLength: 100, example: 'Nala' })
  @WhenPresent()
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(NAME_PATTERN, {
    message:
      'name can only contain letters, spaces, hyphens, apostrophes and periods',
  })
  name?: string;

  @ApiPropertyOptional({ enum: CatGender })
  @WhenPresent()
  @IsEnum(CatGender)
  gender?: CatGender;

  @ApiPropertyOptional()
  @WhenPresent()
  @Trim()
  @IsString()
  @IsNotEmpty()
  story?: string;

  @ApiPropertyOptional({
    example: '2026-09-15',
    description: 'Format yyyy-mm-dd',
  })
  @WhenPresent()
  @Matches(DATE_PATTERN, { message: 'entryDate must be in yyyy-mm-dd format' })
  @IsISO8601({ strict: true })
  entryDate?: string;

  @ApiPropertyOptional({
    example: '2026-05-25',
    description: 'Format yyyy-mm-dd',
  })
  @WhenPresent()
  @Matches(DATE_PATTERN, { message: 'birthDate must be in yyyy-mm-dd format' })
  @IsISO8601({ strict: true })
  birthDate?: string;

  @ApiPropertyOptional()
  @WhenPresent()
  @IsBoolean()
  birthDateIsEstimated?: boolean;

  @ApiPropertyOptional()
  @WhenPresent()
  @IsBoolean()
  vaccinated?: boolean;

  @ApiPropertyOptional()
  @WhenPresent()
  @IsBoolean()
  sterilized?: boolean;

  @ApiPropertyOptional()
  @WhenPresent()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @WhenPresent()
  @IsBoolean()
  isUrgent?: boolean;

  @ApiPropertyOptional()
  @WhenPresent()
  @Trim()
  @IsString()
  @IsNotEmpty()
  healthStatus?: string;

  @ApiPropertyOptional({
    nullable: true,
    type: String,
    description: 'Send null (or an empty text) to clear it',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() || null : value,
  )
  @IsString()
  specialNeeds?: string | null;

  @ApiPropertyOptional({ enum: Compatibility })
  @WhenPresent()
  @IsEnum(Compatibility)
  compatibleWithCats?: Compatibility;

  @ApiPropertyOptional({ enum: Compatibility })
  @WhenPresent()
  @IsEnum(Compatibility)
  compatibleWithDogs?: Compatibility;

  @ApiPropertyOptional({ enum: Compatibility })
  @WhenPresent()
  @IsEnum(Compatibility)
  compatibleWithChildren?: Compatibility;

  @ApiPropertyOptional({ enum: ActivityLevel })
  @WhenPresent()
  @IsEnum(ActivityLevel)
  activityLevel?: ActivityLevel;

  @ApiPropertyOptional({ enum: CatStatus })
  @WhenPresent()
  @IsEnum(CatStatus)
  status?: CatStatus;

  @ApiPropertyOptional({
    type: [String],
    format: 'uuid',
    maxItems: 12,
    uniqueItems: true,
    description: 'Replaces the full list of characteristics',
  })
  @WhenPresent()
  @IsArray()
  @ArrayMaxSize(12)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  characteristicIds?: string[];
}
