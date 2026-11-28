import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import dataSource from '../data-source';
import { CatImage } from '../../modules/cat-images/entities/cat-image.entity';
import { Cat } from '../../modules/cats/entities/cat.entity';
import { CatStatus } from '../../modules/cats/enums';
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
    const catImagesRepository = dataSource.getRepository(CatImage);
    const existingImages = await catImagesRepository.find({
      select: { catId: true, displayOrder: true, imageUrl: true },
    });
    const existingUrls = new Map(
      existingImages.map(({ catId, displayOrder, imageUrl }) => [
        `${catId}:${displayOrder}`,
        imageUrl,
      ]),
    );
    const catImages: Partial<CatImage>[] = [];

    for (const { slug, source, altText, displayOrder } of catImagesSeed) {
      const sourcePath = join(process.cwd(), 'seed-images', source);
      const catId = catIds.get(slug);

      if (!existsSync(sourcePath)) {
        console.warn(`Seed image not found: ${source}`);
        continue;
      }
      if (!catId) {
        continue;
      }

      const codeSeed = displayOrder === 1 ? slug : `${slug}-${displayOrder}`;
      const code = createHash('sha1')
        .update(codeSeed)
        .digest('hex')
        .slice(0, 6);
      const fileName = `${slug}-${code}${extname(source)}`;
      const imageUrl = `/uploads/cats/${fileName}`;
      const existingUrl = existingUrls.get(`${catId}:${displayOrder}`);

      if (displayOrder > 1 && existingUrl && existingUrl !== imageUrl) {
        console.warn(
          `Skipping ${slug} position ${displayOrder}: it already has ${existingUrl}.`,
        );
        continue;
      }

      copyFileSync(sourcePath, join(uploadsDir, fileName));
      catImages.push({ catId, displayOrder, imageUrl, altText });
    }

    if (catImages.length > 0) {
      await catImagesRepository.upsert(catImages, ['catId', 'displayOrder']);
    }

    const available = catsSeed.filter(
      ({ status }) => status === CatStatus.AVAILABLE,
    );
    const featured = catsSeed.filter(({ isFeatured }) => isFeatured);
    const pairs = new Set(
      catsSeed.flatMap(({ adoptionGroupId }) => adoptionGroupId ?? []),
    );

    console.log(
      `Seed completed: ${characteristicsSeed.length} characteristics, ${catsSeed.length} cats and ${catImages.length} cat images upserted.`,
    );
    console.log(
      `Seeded cats: ${catsSeed.length} total, ${available.length} available, ${catsSeed.length - available.length} not available, ${featured.length} featured, ${pairs.size} joint-adoption pairs.`,
    );
    console.log(`Cats in the database: ${await catsRepository.count()}.`);
  } finally {
    await dataSource.destroy();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
