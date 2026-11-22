import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import dataSource from '../data-source';
import { CatImage } from '../../modules/cat-images/entities/cat-image.entity';
import { Cat } from '../../modules/cats/entities/cat.entity';
import { Characteristic } from '../../modules/characteristics/characteristic.entity';
import { catImagesSeed } from './cat-images.seed';
import { catsSeed } from './cats.seed';
import {
  catCharacteristicsSeed,
  characteristicsSeed,
} from './characteristics.seed';

async function seed() {
  await dataSource.initialize();
  try {
    const catsRepository = dataSource.getRepository(Cat);
    const characteristicsRepository = dataSource.getRepository(Characteristic);

    await characteristicsRepository.upsert(characteristicsSeed, ['code']);
    await catsRepository.upsert(catsSeed, ['slug']);

    const characteristics = await characteristicsRepository.find();
    const byCode = new Map(characteristics.map((c) => [c.code, c]));
    const cats = await catsRepository.find({
      relations: { characteristics: true },
    });

    for (const cat of cats) {
      const codes = catCharacteristicsSeed[cat.slug];
      if (!codes) {
        continue;
      }
      cat.characteristics = codes.map((code) => {
        const characteristic = byCode.get(code);
        if (!characteristic) {
          throw new Error(`Unknown characteristic: ${code}`);
        }
        return characteristic;
      });
    }
    await catsRepository.save(cats);

    const uploadsDir = join(process.cwd(), 'uploads', 'cats');
    mkdirSync(uploadsDir, { recursive: true });

    const catIds = new Map(cats.map((cat) => [cat.slug, cat.id]));
    const catImages: Partial<CatImage>[] = [];

    for (const { slug, source, altText } of catImagesSeed) {
      const sourcePath = join(process.cwd(), 'seed-images', source);
      const catId = catIds.get(slug);

      if (!existsSync(sourcePath)) {
        console.warn(`Seed image not found: ${source}`);
        continue;
      }
      if (!catId) {
        continue;
      }

      const fileName = `${slug}${extname(source)}`;
      copyFileSync(sourcePath, join(uploadsDir, fileName));
      catImages.push({
        catId,
        displayOrder: 1,
        imageUrl: `/uploads/cats/${fileName}`,
        altText,
      });
    }

    if (catImages.length > 0) {
      await dataSource
        .getRepository(CatImage)
        .upsert(catImages, ['catId', 'displayOrder']);
    }

    console.log(
      `Seed completed: ${characteristicsSeed.length} characteristics, ${catsSeed.length} cats and ${catImages.length} cat images upserted.`,
    );
  } finally {
    await dataSource.destroy();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
