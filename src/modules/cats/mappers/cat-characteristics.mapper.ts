import { Characteristic } from '../../characteristics/characteristic.entity';
import { CatCharacteristicDto } from '../dto/cat-characteristic.dto';
import { CatGender } from '../enums';

export function toCatCharacteristicDtos(
  gender: CatGender,
  characteristics: Characteristic[],
): CatCharacteristicDto[] {
  return characteristics
    .map((characteristic) => ({
      id: characteristic.id,
      code: characteristic.code,
      label:
        gender === CatGender.FEMALE
          ? characteristic.labelFeminine
          : characteristic.labelMasculine,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'ca'));
}
