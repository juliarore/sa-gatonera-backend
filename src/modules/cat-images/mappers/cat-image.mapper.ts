import { CatImageDto } from '../dto/cat-image.dto';

export function toCatImageDto({
  id,
  imageUrl,
  altText,
  displayOrder,
}: CatImageDto): CatImageDto {
  return { id, imageUrl, altText, displayOrder };
}
