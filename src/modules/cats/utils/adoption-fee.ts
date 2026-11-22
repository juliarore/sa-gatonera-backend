import { CatGender } from '../enums';
import {
  FEMALE_ADOPTION_FEE,
  MALE_ADOPTION_FEE,
  STERILIZED_ADOPTION_FEE,
} from '../constants/adoption-fee.constants';

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
