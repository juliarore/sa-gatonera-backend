import { existsSync } from 'node:fs';
import { readdir, rm } from 'node:fs/promises';
import { basename, join } from 'node:path';
import dataSource from '../data-source';
import { CatImage } from '../../modules/cat-images/entities/cat-image.entity';
import { CAT_UPLOADS_DIR } from '../../modules/cat-images/constants/image-storage.constants';

async function cleanUploads() {
  const confirm = process.argv.includes('--confirm');

  await dataSource.initialize();
  try {
    const images = await dataSource.getRepository(CatImage).find({
      select: { imageUrl: true },
    });

    if (images.length === 0) {
      throw new Error(
        'No rows found in cat_images: refusing to treat every file as unreferenced.',
      );
    }

    if (!existsSync(CAT_UPLOADS_DIR)) {
      console.log(`Nothing to clean: ${CAT_UPLOADS_DIR} does not exist.`);
      return;
    }

    const referenced = new Set(
      images.map(({ imageUrl }) => basename(imageUrl)),
    );
    const entries = await readdir(CAT_UPLOADS_DIR, { withFileTypes: true });
    const orphans = entries
      .filter((entry) => entry.isFile() && !referenced.has(entry.name))
      .map((entry) => entry.name);

    if (orphans.length === 0) {
      console.log('No unreferenced files in uploads/cats.');
      return;
    }

    console.log(`Unreferenced files in uploads/cats (${orphans.length}):`);
    orphans.forEach((name) => console.log(`  ${name}`));

    if (!confirm) {
      console.log('Nothing deleted. Run again with --confirm to delete them.');
      return;
    }

    await Promise.all(
      orphans.map((name) => rm(join(CAT_UPLOADS_DIR, name), { force: true })),
    );
    console.log(`Deleted ${orphans.length} files.`);
  } finally {
    await dataSource.destroy();
  }
}

cleanUploads().catch((error) => {
  console.error(error);
  process.exit(1);
});
