import { CatStatus } from '../enums';

export const MAX_FEATURED_CATS = 3;

export const FEATURED_CATS_FILTER = {
  isFeatured: true,
  status: CatStatus.AVAILABLE,
} as const;
