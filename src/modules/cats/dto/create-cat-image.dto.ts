import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import {
  ALT_TEXT_MAX_LENGTH,
  ALT_TEXT_MIN_LENGTH,
  IsAltText,
} from './cat-validators';

export class CreateCatImageDto {
  @ApiPropertyOptional({
    minLength: ALT_TEXT_MIN_LENGTH,
    maxLength: ALT_TEXT_MAX_LENGTH,
    example: 'Nala sleeping on the sofa',
    description:
      'Alternative text of the image, 10 to 250 characters. If empty or missing, it is generated from the cat name.',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() || undefined : value,
  )
  @IsAltText()
  altText?: string;
}
