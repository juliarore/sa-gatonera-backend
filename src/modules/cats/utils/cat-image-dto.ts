import { CatImageDto } from '../dto/admin-cat-detail.dto';

export function toCatImageDto({
  id,
  imageUrl,
  altText,
  displayOrder,
}: CatImageDto): CatImageDto {
  return { id, imageUrl, altText, displayOrder };
}
