import { CatGender } from '../enums';

export const STERILIZED_ADOPTION_FEE = 150;
export const MALE_ADOPTION_FEE = 200;
export const FEMALE_ADOPTION_FEE = 250;

export function getAdoptionFee(cat: {
  gender: CatGender;
  sterilized: boolean;
}): number {
  if (cat.sterilized) {
    return STERILIZED_ADOPTION_FEE;
  }
  return cat.gender === CatGender.MALE
    ? MALE_ADOPTION_FEE
    : FEMALE_ADOPTION_FEE;
}
