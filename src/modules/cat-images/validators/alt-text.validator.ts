import { applyDecorators } from '@nestjs/common';
import { IsString, Length } from 'class-validator';
import {
  ALT_TEXT_MAX_LENGTH,
  ALT_TEXT_MIN_LENGTH,
} from '../constants/alt-text.constants';

export function IsAltText(): PropertyDecorator {
  return applyDecorators(
    IsString(),
    Length(ALT_TEXT_MIN_LENGTH, ALT_TEXT_MAX_LENGTH, {
      message: `altText must be between ${ALT_TEXT_MIN_LENGTH} and ${ALT_TEXT_MAX_LENGTH} characters`,
    }),
  );
}
