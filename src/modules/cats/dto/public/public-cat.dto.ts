import { ApiProperty } from '@nestjs/swagger';
import { AgeGroup, CatGender, Compatibility } from '../../enums';
import { CatCharacteristicDto } from '../cat-characteristic.dto';

export class PublicCatDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'nala' })
  slug: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: CatGender })
  gender: CatGender;

  @ApiProperty({
    example: 'aprox. 3 anys',
    description: 'Age in months or years, prefixed with "aprox." if estimated',
  })
  ageLabel: string;

  @ApiProperty({ enum: AgeGroup })
  ageGroup: AgeGroup;

  @ApiProperty()
  isUrgent: boolean;

  @ApiProperty({ description: 'The cat is adopted together with another cat' })
  hasJointAdoption: boolean;

  @ApiProperty({ enum: Compatibility, enumName: 'Compatibility' })
  compatibleWithCats: Compatibility;

  @ApiProperty({ enum: Compatibility, enumName: 'Compatibility' })
  compatibleWithDogs: Compatibility;

  @ApiProperty({ enum: Compatibility, enumName: 'Compatibility' })
  compatibleWithChildren: Compatibility;

  @ApiProperty({
    type: [CatCharacteristicDto],
    description: "Characteristics labelled to match the cat's gender",
  })
  characteristics: CatCharacteristicDto[];

  @ApiProperty({
    type: String,
    nullable: true,
    example: '/uploads/cats/nala-ab12cd.jpg',
    description: 'Relative URL of the cover photo (display order 1)',
  })
  coverImageUrl: string | null;

  @ApiProperty({ type: String, nullable: true })
  coverImageAlt: string | null;
}

export class PublicCatsPageDto {
  @ApiProperty({ type: [PublicCatDto] })
  items: PublicCatDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  totalPages: number;
}
