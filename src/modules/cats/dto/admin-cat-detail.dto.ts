import { ApiProperty } from '@nestjs/swagger';
import {
  ActivityLevel,
  AgeGroup,
  CatGender,
  CatStatus,
  Compatibility,
} from '../enums';

export class AdoptionGroupMateDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;
}

export class CatCharacteristicDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'affectionate' })
  code: string;

  @ApiProperty({
    example: 'Carinyosa',
    description: 'Etiqueta segons el gènere del gat',
  })
  label: string;
}

export class AdminCatDetailDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty({ enum: CatGender })
  gender: CatGender;

  @ApiProperty()
  story: string;

  @ApiProperty({ example: '2026-09-15' })
  entryDate: string;

  @ApiProperty()
  healthStatus: string;

  @ApiProperty({ nullable: true, type: String })
  specialNeeds: string | null;

  @ApiProperty({ example: '2026-05-25' })
  birthDate: string;

  @ApiProperty()
  birthDateIsEstimated: boolean;

  @ApiProperty()
  vaccinated: boolean;

  @ApiProperty()
  sterilized: boolean;

  @ApiProperty({ enum: Compatibility })
  compatibleWithCats: Compatibility;

  @ApiProperty({ enum: Compatibility })
  compatibleWithDogs: Compatibility;

  @ApiProperty({ enum: Compatibility })
  compatibleWithChildren: Compatibility;

  @ApiProperty({ enum: ActivityLevel })
  activityLevel: ActivityLevel;

  @ApiProperty({ enum: CatStatus })
  status: CatStatus;

  @ApiProperty()
  isFeatured: boolean;

  @ApiProperty()
  isUrgent: boolean;

  @ApiProperty({ format: 'uuid', nullable: true, type: String })
  adoptionGroupId: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ description: "Cost d'adopció en euros" })
  adoptionFee: number;

  @ApiProperty({ enum: AgeGroup })
  ageGroup: AgeGroup;

  @ApiProperty({ description: 'true si el gat està disponible (available)' })
  isVisible: boolean;

  @ApiProperty({ type: [AdoptionGroupMateDto] })
  adoptionGroupMates: AdoptionGroupMateDto[];

  @ApiProperty({ type: [CatCharacteristicDto] })
  characteristics: CatCharacteristicDto[];
}
