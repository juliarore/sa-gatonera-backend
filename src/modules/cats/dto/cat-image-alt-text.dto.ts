import { ApiProperty } from '@nestjs/swagger';
import {
  ALT_TEXT_MAX_LENGTH,
  ALT_TEXT_MIN_LENGTH,
  IsAltText,
  Trim,
} from './cat-validators';

export class CatImageAltTextDto {
  @ApiProperty({
    minLength: ALT_TEXT_MIN_LENGTH,
    maxLength: ALT_TEXT_MAX_LENGTH,
    example: 'Nala sleeping on the sofa',
    description: 'Alternative text of the image, 10 to 250 characters',
  })
  @Trim()
  @IsAltText()
  altText: string;
}
