import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

const NAME_PATTERN = /^[\p{L}][\p{L}\s.'’-]*$/u;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function Trim(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );
}

export function IsRequiredText(): PropertyDecorator {
  return applyDecorators(Trim(), IsString(), IsNotEmpty());
}

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

export function NullableText(): PropertyDecorator {
  return applyDecorators(
    IsOptional(),
    Transform(({ value }: { value: unknown }) =>
      typeof value === 'string' ? value.trim() || null : value,
    ),
    IsString(),
  );
}
