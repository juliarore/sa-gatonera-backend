import { ApiProperty } from '@nestjs/swagger';
import { AgeGroup, CatGender, CatStatus } from '../enums';

export class AdminCatListItemDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty({ enum: CatGender })
  gender: CatGender;

  @ApiProperty({ example: '2026-05-25' })
  birthDate: string;

  @ApiProperty({ enum: CatStatus })
  status: CatStatus;

  @ApiProperty()
  isUrgent: boolean;

  @ApiProperty({ example: '2026-09-15' })
  entryDate: string;

  @ApiProperty({ enum: AgeGroup })
  ageGroup: AgeGroup;

  @ApiProperty({ description: 'true si el gat està disponible (available)' })
  isVisible: boolean;
}

export class AdminCatsPageDto {
  @ApiProperty({ type: [AdminCatListItemDto] })
  items: AdminCatListItemDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
