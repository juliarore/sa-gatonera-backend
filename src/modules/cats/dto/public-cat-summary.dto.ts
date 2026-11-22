import { ApiProperty } from '@nestjs/swagger';
import { CatGender, Compatibility } from '../enums';
import { CatCharacteristicDto } from './admin-cat-detail.dto';

export class PublicCatSummaryDto {
  @ApiProperty()
  name: string;

  @ApiProperty({ example: 'nala' })
  slug: string;

  @ApiProperty({ enum: CatGender })
  gender: CatGender;

  @ApiProperty({
    example: '2026-09-01',
    description: 'Birth date (YYYY-MM-DD)',
  })
  birthDate: string;

  @ApiProperty()
  isUrgent: boolean;

  @ApiProperty({ description: 'The cat is adopted together with another cat' })
  isJointAdoption: boolean;

  @ApiProperty({ enum: Compatibility, enumName: 'Compatibility' })
  compatibleWithCats: Compatibility;

  @ApiProperty({ enum: Compatibility, enumName: 'Compatibility' })
  compatibleWithDogs: Compatibility;

  @ApiProperty({ enum: Compatibility, enumName: 'Compatibility' })
  compatibleWithChildren: Compatibility;

  @ApiProperty({ type: [CatCharacteristicDto] })
  characteristics: CatCharacteristicDto[];

  @ApiProperty({
    type: String,
    nullable: true,
    example: '/uploads/cats/nala-ab12cd.jpg',
    description: 'Relative URL of the cover photo',
  })
  coverImageUrl: string | null;

  @ApiProperty({ type: String, nullable: true })
  coverImageAlt: string | null;
}
