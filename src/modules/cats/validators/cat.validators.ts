import { applyDecorators } from '@nestjs/common';
import { IsRequiredText } from '../../../common/validators/text.validators';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsISO8601,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';
import {
  DATE_PATTERN,
  NAME_PATTERN,
} from '../constants/cat-validation.constants';

export function IsCatName(): PropertyDecorator {
  return applyDecorators(
    IsRequiredText(),
    MaxLength(100),
    Matches(NAME_PATTERN, {
      message:
        'name can only contain letters, spaces, hyphens, apostrophes and periods',
    }),
  );
}

export function IsCatDate(field: string): PropertyDecorator {
  return applyDecorators(
    Matches(DATE_PATTERN, { message: `${field} must be in yyyy-mm-dd format` }),
    IsISO8601({ strict: true }),
  );
}

export function IsCharacteristicIds(): PropertyDecorator {
  return applyDecorators(
    IsArray(),
    ArrayMinSize(1, { message: 'at least one characteristic is required' }),
    ArrayMaxSize(12),
    ArrayUnique(),
    IsUUID('all', { each: true }),
  );
}
