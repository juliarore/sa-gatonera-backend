import dataSource from '../data-source';
import { Cat } from '../../modules/cats/cat.entity';
import { Characteristic } from '../../modules/characteristics/characteristic.entity';
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
    const cats = await catsRepository.find({ relations: { characteristics: true } });

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

    console.log(
      `Seed completed: ${characteristicsSeed.length} characteristics and ${catsSeed.length} cats upserted.`,
    );
  } finally {
    await dataSource.destroy();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
