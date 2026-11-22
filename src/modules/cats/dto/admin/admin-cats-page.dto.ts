import { ApiProperty } from '@nestjs/swagger';
import { AgeGroup, CatGender, CatStatus } from '../../enums';

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

  @ApiProperty({
    example: 'aprox. 3 anys',
    description: 'Age in months or years, prefixed with "aprox." if estimated',
  })
  ageLabel: string;

  @ApiProperty({ enum: AgeGroup })
  ageGroup: AgeGroup;

  @ApiProperty({
    description: 'True if the cat is available (status available)',
  })
  isVisible: boolean;

  @ApiProperty({ description: 'True if the cat is featured on the home page' })
  isFeatured: boolean;

  @ApiProperty({
    nullable: true,
    type: String,
    example: '/uploads/cats/nala.jpeg',
    description: 'Relative URL of the cover image (display order 1)',
  })
  coverImageUrl: string | null;

  @ApiProperty({
    nullable: true,
    type: String,
    description: 'Alternative text of the cover image',
  })
  coverImageAlt: string | null;
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
