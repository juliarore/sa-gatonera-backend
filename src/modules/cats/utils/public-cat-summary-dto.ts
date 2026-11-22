import { Cat } from '../cat.entity';
import { PublicCatSummaryDto } from '../dto/public-cat-summary.dto';
import { toCatCharacteristicDtos } from './characteristics-dto';

export function toPublicCatSummaryDto(cat: Cat): PublicCatSummaryDto {
  const cover = cat.images.find((image) => image.displayOrder === 1);

  return {
    name: cat.name,
    slug: cat.slug,
    gender: cat.gender,
    birthDate: cat.birthDate,
    isUrgent: cat.isUrgent,
    isJointAdoption: cat.adoptionGroupId !== null,
    compatibleWithCats: cat.compatibleWithCats,
    compatibleWithDogs: cat.compatibleWithDogs,
    compatibleWithChildren: cat.compatibleWithChildren,
    characteristics: toCatCharacteristicDtos(cat.gender, cat.characteristics),
    coverImageUrl: cover?.imageUrl ?? null,
    coverImageAlt: cover?.altText ?? null,
  };
}
