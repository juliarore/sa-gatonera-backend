import { PublicCatDto } from '../dto/public/public-cat.dto';
import { Cat } from '../entities/cat.entity';
import { getAgeGroup } from '../utils/age-group';
import { getAgeLabel } from '../utils/age-label';
import { toCatCharacteristicDtos } from './cat-characteristics.mapper';

export function toPublicCatDto(cat: Cat): PublicCatDto {
  const cover = cat.images.find((image) => image.displayOrder === 1);

  return {
    id: cat.id,
    slug: cat.slug,
    name: cat.name,
    gender: cat.gender,
    ageLabel: getAgeLabel(cat.birthDate, cat.birthDateIsEstimated),
    ageGroup: getAgeGroup(cat.birthDate),
    isUrgent: cat.isUrgent,
    hasJointAdoption: cat.adoptionGroupId !== null,
    compatibleWithCats: cat.compatibleWithCats,
    compatibleWithDogs: cat.compatibleWithDogs,
    compatibleWithChildren: cat.compatibleWithChildren,
    characteristics: toCatCharacteristicDtos(cat.gender, cat.characteristics),
    coverImageUrl: cover?.imageUrl ?? null,
    coverImageAlt: cover?.altText ?? null,
  };
}
