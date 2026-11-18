import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { ActivityLevel, CatGender, CatStatus, Compatibility } from '../enums';
import {
  IsCatDate,
  IsCatName,
  IsCharacteristicIds,
  IsRequiredText,
  NullableText,
} from './cat-validators';

function WhenPresent(): PropertyDecorator {
  return ValidateIf((_object, value) => value !== undefined);
}

export class UpdateCatDto {
  @ApiPropertyOptional({ maxLength: 100, example: 'Nala' })
  @WhenPresent()
  @IsCatName()
  name?: string;

  @ApiPropertyOptional({ enum: CatGender })
  @WhenPresent()
  @IsEnum(CatGender)
  gender?: CatGender;

  @ApiPropertyOptional()
  @WhenPresent()
  @IsRequiredText()
  story?: string;

  @ApiPropertyOptional({
    example: '2026-09-15',
    description: 'Format yyyy-mm-dd',
  })
  @WhenPresent()
  @IsCatDate('entryDate')
  entryDate?: string;

  @ApiPropertyOptional({
    example: '2026-05-25',
    description: 'Format yyyy-mm-dd',
  })
  @WhenPresent()
  @IsCatDate('birthDate')
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
  @IsRequiredText()
  healthStatus?: string;

  @ApiPropertyOptional({
    nullable: true,
    type: String,
    description: 'Send null (or an empty text) to clear it',
  })
  @NullableText()
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
    minItems: 1,
    maxItems: 12,
    uniqueItems: true,
    description: 'Replaces the full list of characteristics',
  })
  @WhenPresent()
  @IsCharacteristicIds()
  characteristicIds?: string[];

  @ApiPropertyOptional({
    format: 'uuid',
    nullable: true,
    type: String,
    description:
      'Id of the cat to adopt jointly with, or null to remove the joint adoption',
  })
  @IsOptional()
  @IsUUID()
  pairedCatId?: string | null;
}
