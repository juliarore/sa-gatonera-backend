import {
  PublicCatDetailDto,
  PublicPairedCatDto,
} from '../dto/public/public-cat-detail.dto';
import { PublicCatDto } from '../dto/public/public-cat.dto';
import { Cat } from '../entities/cat.entity';
import { getAdoptionFee } from '../utils/adoption-fee';
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

function toPublicPairedCatDto(cat: Cat): PublicPairedCatDto {
  const { slug, name, gender, coverImageUrl, coverImageAlt } =
    toPublicCatDto(cat);
  return { slug, name, gender, coverImageUrl, coverImageAlt };
}

export function toPublicCatDetailDto(
  cat: Cat,
  pairedCat: Cat | null,
): PublicCatDetailDto {
  const {
    id,
    slug,
    name,
    gender,
    ageLabel,
    ageGroup,
    isUrgent,
    compatibleWithCats,
    compatibleWithDogs,
    compatibleWithChildren,
    characteristics,
  } = toPublicCatDto(cat);

  return {
    id,
    slug,
    name,
    gender,
    ageLabel,
    ageGroup,
    isUrgent,
    story: cat.story,
    specialNeeds: cat.specialNeeds,
    healthStatus: cat.healthStatus,
    vaccinated: cat.vaccinated,
    sterilized: cat.sterilized,
    compatibleWithCats,
    compatibleWithDogs,
    compatibleWithChildren,
    characteristics,
    images: cat.images.map(({ imageUrl, altText }) => ({
      url: imageUrl,
      alt: altText,
    })),
    adoptionCost: getAdoptionFee(cat),
    pairedCat: pairedCat && toPublicPairedCatDto(pairedCat),
  };
}
