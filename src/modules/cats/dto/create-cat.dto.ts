import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ActivityLevel, CatGender, CatStatus, Compatibility } from '../enums';
import {
  IsCatDate,
  IsCatName,
  IsCharacteristicIds,
  IsRequiredText,
  NullableText,
} from './cat-validators';

export class CreateCatDto {
  @ApiProperty({ maxLength: 100, example: 'Nala' })
  @IsCatName()
  name: string;

  @ApiProperty({ enum: CatGender })
  @IsEnum(CatGender)
  gender: CatGender;

  @ApiProperty()
  @IsRequiredText()
  story: string;

  @ApiProperty({ example: '2026-09-15', description: 'Format yyyy-mm-dd' })
  @IsCatDate('entryDate')
  entryDate: string;

  @ApiProperty()
  @IsRequiredText()
  healthStatus: string;

  @ApiProperty({ example: '2026-05-25', description: 'Format yyyy-mm-dd' })
  @IsCatDate('birthDate')
  birthDate: string;

  @ApiProperty()
  @IsBoolean()
  birthDateIsEstimated: boolean;

  @ApiProperty()
  @IsBoolean()
  vaccinated: boolean;

  @ApiProperty()
  @IsBoolean()
  sterilized: boolean;

  @ApiProperty({ enum: Compatibility })
  @IsEnum(Compatibility)
  compatibleWithCats: Compatibility;

  @ApiProperty({ enum: Compatibility })
  @IsEnum(Compatibility)
  compatibleWithDogs: Compatibility;

  @ApiProperty({ enum: Compatibility })
  @IsEnum(Compatibility)
  compatibleWithChildren: Compatibility;

  @ApiProperty({ enum: ActivityLevel })
  @IsEnum(ActivityLevel)
  activityLevel: ActivityLevel;

  @ApiProperty({
    type: [String],
    format: 'uuid',
    minItems: 1,
    maxItems: 12,
    uniqueItems: true,
  })
  @IsCharacteristicIds()
  characteristicIds: string[];

  @ApiPropertyOptional({
    nullable: true,
    type: String,
    description: 'An empty text is stored as null',
  })
  @NullableText()
  specialNeeds?: string | null;

  @ApiPropertyOptional({ enum: CatStatus, default: CatStatus.AVAILABLE })
  @IsOptional()
  @IsEnum(CatStatus)
  status?: CatStatus;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;

  @ApiPropertyOptional({
    format: 'uuid',
    nullable: true,
    type: String,
    description: 'Id of the cat to adopt jointly with',
  })
  @IsOptional()
  @IsUUID()
  pairedCatId?: string | null;
}
