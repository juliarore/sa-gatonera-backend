import dataSource from '../data-source';
import { Cat } from '../../modules/cats/cat.entity';
import { catsSeed } from './cats.seed';

async function seed() {
  await dataSource.initialize();
  try {
    await dataSource.getRepository(Cat).upsert(catsSeed, ['slug']);
    console.log(`Seed completed: ${catsSeed.length} cats upserted.`);
  } finally {
    await dataSource.destroy();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
