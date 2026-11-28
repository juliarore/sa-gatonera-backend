import { ApiProperty, PickType } from '@nestjs/swagger';
import { PublicCatDto } from './public-cat.dto';

export class PublicCatImageDto {
  @ApiProperty({
    example: '/uploads/cats/nala-ab12cd.jpg',
    description: 'Relative URL of the image',
  })
  url: string;

  @ApiProperty()
  alt: string;
}

export class PublicPairedCatDto extends PickType(PublicCatDto, [
  'slug',
  'name',
  'gender',
  'coverImageUrl',
  'coverImageAlt',
] as const) {}

export class PublicCatDetailDto extends PickType(PublicCatDto, [
  'id',
  'slug',
  'name',
  'gender',
  'ageLabel',
  'ageGroup',
  'isUrgent',
  'compatibleWithCats',
  'compatibleWithDogs',
  'compatibleWithChildren',
  'characteristics',
] as const) {
  @ApiProperty()
  story: string;

  @ApiProperty({ type: String, nullable: true })
  specialNeeds: string | null;

  @ApiProperty()
  healthStatus: string;

  @ApiProperty()
  vaccinated: boolean;

  @ApiProperty()
  sterilized: boolean;

  @ApiProperty({
    type: [PublicCatImageDto],
    description: 'Photos ordered by display order, the first one is the cover',
  })
  images: PublicCatImageDto[];

  @ApiProperty({
    example: 150,
    description: 'Adoption cost in euros (RF-12)',
  })
  adoptionCost: number;

  @ApiProperty({
    type: PublicPairedCatDto,
    nullable: true,
    description:
      'Cat adopted together with this one, only if it is also available',
  })
  pairedCat: PublicPairedCatDto | null;
}
