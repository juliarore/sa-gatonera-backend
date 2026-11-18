import { randomInt } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CatImage } from './cat-image.entity';
import { Cat } from './cat.entity';
import { CatImageDto } from './dto/admin-cat-detail.dto';
import { CatErrorCode } from './enums';
import { toCatImageDto } from './utils/cat-image-dto';
import { coded } from './utils/coded-exception';
import { detectImageExtension } from './utils/image-type';

export const MAX_IMAGE_MB = 8;
export const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024;
export const MAX_IMAGES_PER_CAT = 8;

const POSITION_OFFSET = 1000;
const UPLOADS_DIR = join(process.cwd(), 'uploads', 'cats');
const NAME_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

export interface UploadedImage {
  buffer: Buffer;
}

@Injectable()
export class CatImagesService {
  constructor(
    @InjectRepository(Cat)
    private readonly catsRepository: Repository<Cat>,
    @InjectRepository(CatImage)
    private readonly imagesRepository: Repository<CatImage>,
  ) {}

  async add(
    catId: string,
    file: UploadedImage | undefined,
    altText?: string,
  ): Promise<CatImageDto> {
    await this.findCat(this.catsRepository, catId);

    if (!file) {
      throw new BadRequestException('An image file is required');
    }

    const extension = detectImageExtension(file.buffer);

    if (!extension) {
      throw new BadRequestException(
        'Only JPEG, PNG and WebP images are allowed',
      );
    }

    let filePath: string | undefined;

    try {
      return await this.imagesRepository.manager.transaction(
        async (manager) => {
          const cat = await this.findCat(
            manager.getRepository(Cat),
            catId,
            true,
          );
          const images = await this.listImages(manager, catId);

          if (images.length >= MAX_IMAGES_PER_CAT) {
            throw coded(
              ConflictException,
              `A cat can have at most ${MAX_IMAGES_PER_CAT} images`,
              CatErrorCode.IMAGE_LIMIT_REACHED,
            );
          }

          const fileName = await this.writeImage(
            cat.slug,
            extension,
            file.buffer,
          );
          filePath = join(UPLOADS_DIR, fileName);

          const displayOrder = (images.at(-1)?.displayOrder ?? 0) + 1;
          const repository = manager.getRepository(CatImage);
          const image = await repository.save(
            repository.create({
              catId,
              imageUrl: `/uploads/cats/${fileName}`,
              altText:
                altText ??
                (displayOrder === 1
                  ? `Fotografia de ${cat.name}`
                  : `Fotografia de ${cat.name} (${displayOrder})`),
              displayOrder,
            }),
          );

          return toCatImageDto(image);
        },
      );
    } catch (error) {
      if (filePath) {
        await rm(filePath, { force: true });
      }
      throw error;
    }
  }

  async updateAltText(
    catId: string,
    imageId: string,
    altText: string,
  ): Promise<CatImageDto> {
    const image = await this.findImage(catId, imageId);
    image.altText = altText;

    return toCatImageDto(await this.imagesRepository.save(image));
  }

  async move(
    catId: string,
    imageId: string,
    position: number,
  ): Promise<CatImageDto[]> {
    return this.imagesRepository.manager.transaction(async (manager) => {
      await this.findCat(manager.getRepository(Cat), catId, true);
      const images = await this.listImages(manager, catId);
      const index = images.findIndex((image) => image.id === imageId);

      if (index === -1) {
        throw new NotFoundException(`Image ${imageId} not found`);
      }

      if (position > images.length) {
        throw new BadRequestException(
          `position must not be greater than the number of images (${images.length})`,
        );
      }

      if (index === position - 1) {
        return images.map(toCatImageDto);
      }

      const [image] = images.splice(index, 1);
      images.splice(position - 1, 0, image);

      return this.reorder(manager, catId, images);
    });
  }

  async remove(catId: string, imageId: string): Promise<void> {
    const imageUrl = await this.imagesRepository.manager.transaction(
      async (manager) => {
        await this.findCat(manager.getRepository(Cat), catId, true);
        const images = await this.listImages(manager, catId);
        const image = images.find((item) => item.id === imageId);

        if (!image) {
          throw new NotFoundException(`Image ${imageId} not found`);
        }

        await manager.getRepository(CatImage).delete(image.id);
        await this.reorder(
          manager,
          catId,
          images.filter((item) => item.id !== imageId),
        );

        return image.imageUrl;
      },
    );

    await rm(join(UPLOADS_DIR, basename(imageUrl)), { force: true });
  }

  private async findCat(
    cats: Repository<Cat>,
    id: string,
    lock = false,
  ): Promise<Cat> {
    const cat = await cats.findOne({
      where: { id },
      ...(lock && { lock: { mode: 'pessimistic_write' as const } }),
    });

    if (!cat) {
      throw new NotFoundException(`Cat ${id} not found`);
    }

    return cat;
  }

  private async findImage(catId: string, imageId: string): Promise<CatImage> {
    await this.findCat(this.catsRepository, catId);
    const image = await this.imagesRepository.findOne({
      where: { id: imageId, catId },
    });

    if (!image) {
      throw new NotFoundException(`Image ${imageId} not found`);
    }

    return image;
  }

  private listImages(
    manager: EntityManager,
    catId: string,
  ): Promise<CatImage[]> {
    return manager.getRepository(CatImage).find({
      where: { catId },
      order: { displayOrder: 'ASC' },
    });
  }

  private async reorder(
    manager: EntityManager,
    catId: string,
    images: CatImage[],
  ): Promise<CatImageDto[]> {
    const repository = manager.getRepository(CatImage);

    await repository.update(
      { catId },
      { displayOrder: () => `"display_order" + ${POSITION_OFFSET}` },
    );

    for (const [index, image] of images.entries()) {
      image.displayOrder = index + 1;
      await repository.update(image.id, { displayOrder: image.displayOrder });
    }

    return images.map(toCatImageDto);
  }

  private async writeImage(
    slug: string,
    extension: string,
    buffer: Buffer,
  ): Promise<string> {
    await mkdir(UPLOADS_DIR, { recursive: true });

    for (;;) {
      const suffix = Array.from(
        { length: 6 },
        () => NAME_CHARS[randomInt(NAME_CHARS.length)],
      ).join('');
      const fileName = `${slug}-${suffix}.${extension}`;

      try {
        await writeFile(join(UPLOADS_DIR, fileName), buffer, { flag: 'wx' });
        return fileName;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
          throw error;
        }
      }
    }
  }
}
