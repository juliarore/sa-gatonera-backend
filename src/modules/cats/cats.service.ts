import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { rm } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { EntityManager, In, IsNull, Not, Repository } from 'typeorm';
import { Characteristic } from '../characteristics/characteristic.entity';
import { CatImage } from '../cat-images/entities/cat-image.entity';
import { Cat } from './entities/cat.entity';
import { AdminCatDetailDto } from './dto/admin/admin-cat-detail.dto';
import { AdoptionGroupMateDto } from './dto/admin/adoption-group-mate.dto';
import { AdminCatsPageDto } from './dto/admin/admin-cats-page.dto';
import { AdminCatsQueryDto } from './dto/admin/admin-cats-query.dto';
import { CreateCatDto } from './dto/admin/create-cat.dto';
import { FeaturedSummaryDto } from './dto/admin/featured-summary.dto';
import { PublicCatDto, PublicCatsPageDto } from './dto/public/public-cat.dto';
import { PublicCatsPageQueryDto } from './dto/public/public-cats-page-query.dto';
import { UpdateCatDto } from './dto/admin/update-cat.dto';
import { CatErrorCode, CatStatus, PublicCatsSort } from './enums';
import { getAdoptionFee } from './utils/adoption-fee';
import { getAgeGroup, getBirthDateRange } from './utils/age-group';
import { getAgeLabel } from './utils/age-label';
import { toCatImageDto } from '../cat-images/mappers/cat-image.mapper';
import { toCatCharacteristicDtos } from './mappers/cat-characteristics.mapper';
import { coded } from '../../common/errors/coded-exception';
import { toPublicCatDto } from './mappers/public-cat.mapper';
import { slugify } from './utils/slug';
import { CAT_UPLOADS_DIR } from '../cat-images/constants/image-storage.constants';
import {
  FEATURED_CATS_FILTER,
  MAX_FEATURED_CATS,
} from './constants/featured-cats.constants';

const TIE_BREAK: Record<string, 'ASC' | 'DESC'> = {
  'cat.createdAt': 'ASC',
  'cat.id': 'ASC',
};

const PUBLIC_CATS_ORDER: Record<
  PublicCatsSort,
  Record<string, 'ASC' | 'DESC'>
> = {
  [PublicCatsSort.OLDEST]: { 'cat.entryDate': 'ASC', ...TIE_BREAK },
  [PublicCatsSort.RECENT]: {
    'cat.entryDate': 'DESC',
    'cat.createdAt': 'DESC',
    'cat.id': 'ASC',
  },
  [PublicCatsSort.URGENT]: {
    'cat.isUrgent': 'DESC',
    'cat.entryDate': 'ASC',
    ...TIE_BREAK,
  },
  [PublicCatsSort.AGE_ASC]: { 'cat.birthDate': 'DESC', ...TIE_BREAK },
  [PublicCatsSort.AGE_DESC]: { 'cat.birthDate': 'ASC', ...TIE_BREAK },
  [PublicCatsSort.NAME]: { 'cat.name': 'ASC', ...TIE_BREAK },
  [PublicCatsSort.NAME_DESC]: { 'cat.name': 'DESC', ...TIE_BREAK },
};

const FEATURED_FILL_ORDER: Record<string, 'ASC' | 'DESC'> = {
  'cat.isUrgent': 'DESC',
  'cat.entryDate': 'ASC',
  'cat.createdAt': 'ASC',
  'cat.id': 'ASC',
};

@Injectable()
export class CatsService {
  constructor(
    @InjectRepository(Cat)
    private readonly catsRepository: Repository<Cat>,
  ) {}

  async findPublicPage(
    query: PublicCatsPageQueryDto,
  ): Promise<PublicCatsPageDto> {
    const { page, pageSize, sort } = query;

    const [cats, total] = await this.createPublicCatsQuery()
      .orderBy(PUBLIC_CATS_ORDER[sort])
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      items: cats.map(toPublicCatDto),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findPublicFeatured(): Promise<PublicCatDto[]> {
    const featured = await this.createPublicCatsQuery()
      .andWhere('cat.isFeatured = true')
      .orderBy(FEATURED_FILL_ORDER)
      .take(MAX_FEATURED_CATS)
      .getMany();

    const missing = MAX_FEATURED_CATS - featured.length;
    const fillers =
      missing > 0
        ? await this.createPublicCatsQuery()
            .andWhere(
              featured.length > 0 ? 'cat.id NOT IN (:...featuredIds)' : '1 = 1',
              { featuredIds: featured.map(({ id }) => id) },
            )
            .orderBy(FEATURED_FILL_ORDER)
            .take(missing)
            .getMany()
        : [];

    return [...featured, ...fillers].map(toPublicCatDto);
  }

  async findForAdmin(query: AdminCatsQueryDto): Promise<AdminCatsPageDto> {
    const { search, status, ageGroup, page, limit } = query;

    const qb = this.catsRepository
      .createQueryBuilder('cat')
      .select([
        'cat.id',
        'cat.name',
        'cat.slug',
        'cat.gender',
        'cat.birthDate',
        'cat.birthDateIsEstimated',
        'cat.status',
        'cat.isUrgent',
        'cat.isFeatured',
        'cat.entryDate',
        'cat.createdAt',
      ])
      .leftJoin('cat.images', 'cover', 'cover.displayOrder = 1')
      .addSelect(['cover.id', 'cover.imageUrl', 'cover.altText'])
      .orderBy('cat.entryDate', 'DESC')
      .addOrderBy('cat.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      const escaped = search.replace(/[\\%_]/g, '\\$&');
      qb.andWhere('cat.name ILIKE :search', { search: `%${escaped}%` });
    }

    if (status) {
      qb.andWhere('cat.status = :status', { status });
    }

    if (ageGroup) {
      const { after, onOrBefore } = getBirthDateRange(ageGroup);
      if (after) {
        qb.andWhere('cat.birthDate > :after', { after });
      }
      if (onOrBefore) {
        qb.andWhere('cat.birthDate <= :onOrBefore', { onOrBefore });
      }
    }

    const [cats, total] = await qb.getManyAndCount();

    return {
      items: cats.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        gender: cat.gender,
        birthDate: cat.birthDate,
        status: cat.status,
        isUrgent: cat.isUrgent,
        isFeatured: cat.isFeatured,
        entryDate: cat.entryDate,
        ageLabel: getAgeLabel(cat.birthDate, cat.birthDateIsEstimated),
        ageGroup: getAgeGroup(cat.birthDate),
        isVisible: cat.status === CatStatus.AVAILABLE,
        coverImageUrl: cat.images[0]?.imageUrl ?? null,
        coverImageAlt: cat.images[0]?.altText ?? null,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOneForAdmin(id: string): Promise<AdminCatDetailDto> {
    const cat = await this.catsRepository.findOne({
      where: { id },
      relations: { characteristics: true, images: true },
      order: { images: { displayOrder: 'ASC' } },
    });

    if (!cat) {
      throw new NotFoundException(`Cat ${id} not found`);
    }

    const adoptionGroupMates = cat.adoptionGroupId
      ? await this.catsRepository.find({
          select: { id: true, name: true },
          where: { adoptionGroupId: cat.adoptionGroupId, id: Not(cat.id) },
          order: { name: 'ASC' },
        })
      : [];

    const characteristics = toCatCharacteristicDtos(
      cat.gender,
      cat.characteristics,
    );

    return {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      gender: cat.gender,
      story: cat.story,
      entryDate: cat.entryDate,
      healthStatus: cat.healthStatus,
      specialNeeds: cat.specialNeeds,
      birthDate: cat.birthDate,
      birthDateIsEstimated: cat.birthDateIsEstimated,
      vaccinated: cat.vaccinated,
      sterilized: cat.sterilized,
      compatibleWithCats: cat.compatibleWithCats,
      compatibleWithDogs: cat.compatibleWithDogs,
      compatibleWithChildren: cat.compatibleWithChildren,
      activityLevel: cat.activityLevel,
      status: cat.status,
      isFeatured: cat.isFeatured,
      isUrgent: cat.isUrgent,
      adoptionGroupId: cat.adoptionGroupId,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
      adoptionFee: getAdoptionFee(cat),
      ageLabel: getAgeLabel(cat.birthDate, cat.birthDateIsEstimated),
      ageGroup: getAgeGroup(cat.birthDate),
      isVisible: cat.status === CatStatus.AVAILABLE,
      adoptionGroupMates: adoptionGroupMates.map(({ id, name }) => ({
        id,
        name,
      })),
      characteristics,
      images: cat.images.map(toCatImageDto),
    };
  }

  async createForAdmin(dto: CreateCatDto): Promise<AdminCatDetailDto> {
    const id = await this.catsRepository.manager.transaction(
      async (manager) => {
        const cats = manager.getRepository(Cat);
        const {
          characteristicIds,
          pairedCatId,
          status,
          isFeatured,
          isUrgent,
          ...fields
        } = dto;

        await this.assertFeaturedAllowed(cats, {
          isFeatured: isFeatured ?? false,
          status: status ?? CatStatus.AVAILABLE,
        });

        const characteristics = await this.findCharacteristics(
          manager,
          characteristicIds,
        );
        const cat = await cats.save(
          cats.create({
            ...fields,
            slug: await this.generateSlug(cats, fields.name),
            status: status ?? CatStatus.AVAILABLE,
            isFeatured: isFeatured ?? false,
            isUrgent: isUrgent ?? false,
            characteristics,
          }),
        );

        if (pairedCatId) {
          await this.updatePairing(cats, cat, pairedCatId);
          await cats.save(cat);
        }

        return cat.id;
      },
    );

    return this.findOneForAdmin(id);
  }

  async updateForAdmin(
    id: string,
    dto: UpdateCatDto,
  ): Promise<AdminCatDetailDto> {
    await this.catsRepository.manager.transaction(async (manager) => {
      const cats = manager.getRepository(Cat);
      const cat = await cats.findOne({ where: { id } });

      if (!cat) {
        throw new NotFoundException(`Cat ${id} not found`);
      }

      const { characteristicIds, pairedCatId, ...fields } = dto;
      const wasCounted = cat.isFeatured && cat.status === CatStatus.AVAILABLE;
      const status = fields.status ?? cat.status;
      const isFeatured =
        fields.isFeatured ??
        (fields.status !== undefined && status !== CatStatus.AVAILABLE
          ? false
          : cat.isFeatured);

      if (fields.isFeatured !== undefined || fields.status !== undefined) {
        await this.assertFeaturedAllowed(
          cats,
          { isFeatured, status },
          id,
          wasCounted,
        );
      }

      Object.assign(cat, fields, { isFeatured });

      if (characteristicIds !== undefined) {
        cat.characteristics = await this.findCharacteristics(
          manager,
          characteristicIds,
        );
      }

      if (pairedCatId !== undefined) {
        await this.updatePairing(cats, cat, pairedCatId);
      }

      await cats.save(cat);
    });

    return this.findOneForAdmin(id);
  }

  async deleteForAdmin(id: string): Promise<void> {
    const imageUrls = await this.catsRepository.manager.transaction(
      async (manager) => {
        const cats = manager.getRepository(Cat);
        const cat = await cats.findOne({
          where: { id },
          lock: { mode: 'pessimistic_write' },
        });

        if (!cat) {
          throw new NotFoundException(`Cat ${id} not found`);
        }

        const images = await manager
          .getRepository(CatImage)
          .find({ select: { imageUrl: true }, where: { catId: id } });

        await this.releaseGroup(cats, cat);
        await cats.delete(id);

        return images.map(({ imageUrl }) => imageUrl);
      },
    );

    await Promise.all(
      imageUrls.map((imageUrl) =>
        rm(join(CAT_UPLOADS_DIR, basename(imageUrl)), { force: true }),
      ),
    );
  }

  async findPairedCatOptions(catId?: string): Promise<AdoptionGroupMateDto[]> {
    const cat = catId
      ? await this.catsRepository.findOne({ where: { id: catId } })
      : null;

    if (catId && !cat) {
      throw new NotFoundException(`Cat ${catId} not found`);
    }

    const candidate = {
      status: Not(CatStatus.ADOPTED),
      ...(catId && { id: Not(catId) }),
    };

    return this.catsRepository.find({
      select: { id: true, name: true },
      where: [
        { ...candidate, adoptionGroupId: IsNull() },
        { ...candidate, adoptionGroupId: cat?.adoptionGroupId ?? IsNull() },
      ],
      order: { name: 'ASC' },
    });
  }

  async getFeaturedSummary(): Promise<FeaturedSummaryDto> {
    return {
      count: await this.countFeatured(this.catsRepository),
      max: MAX_FEATURED_CATS,
    };
  }

  private createPublicCatsQuery() {
    return this.catsRepository
      .createQueryBuilder('cat')
      .leftJoinAndSelect('cat.characteristics', 'characteristic')
      .leftJoinAndSelect('cat.images', 'cover', 'cover.displayOrder = 1')
      .where('cat.status = :status', { status: CatStatus.AVAILABLE });
  }

  private async assertFeaturedAllowed(
    cats: Repository<Cat>,
    cat: Pick<Cat, 'isFeatured' | 'status'>,
    exceptId?: string,
    alreadyCounted = false,
  ): Promise<void> {
    if (!cat.isFeatured) {
      return;
    }

    if (cat.status !== CatStatus.AVAILABLE) {
      throw coded(
        ConflictException,
        'Only cats that are available for adoption can be featured.',
        CatErrorCode.FEATURED_NOT_AVAILABLE,
      );
    }

    if (!alreadyCounted) {
      await this.assertFeaturedLimit(cats, exceptId);
    }
  }

  private async assertFeaturedLimit(
    cats: Repository<Cat>,
    exceptId?: string,
  ): Promise<void> {
    if ((await this.countFeatured(cats, exceptId)) >= MAX_FEATURED_CATS) {
      throw coded(
        ConflictException,
        `Only ${MAX_FEATURED_CATS} cats can be featured on the home page. Remove one before adding another.`,
        CatErrorCode.FEATURED_LIMIT_REACHED,
      );
    }
  }

  private countFeatured(
    cats: Repository<Cat>,
    exceptId?: string,
  ): Promise<number> {
    return cats.countBy({
      ...FEATURED_CATS_FILTER,
      ...(exceptId && { id: Not(exceptId) }),
    });
  }

  private async findCharacteristics(
    manager: EntityManager,
    characteristicIds: string[],
  ): Promise<Characteristic[]> {
    const characteristics = await manager
      .getRepository(Characteristic)
      .findBy({ id: In(characteristicIds) });
    const foundIds = new Set(characteristics.map(({ id }) => id));
    const missingIds = characteristicIds.filter((id) => !foundIds.has(id));

    if (missingIds.length > 0) {
      throw coded(
        BadRequestException,
        `Unknown characteristic ids: ${missingIds.join(', ')}`,
        CatErrorCode.UNKNOWN_CHARACTERISTICS,
      );
    }

    return characteristics;
  }

  private async generateSlug(
    cats: Repository<Cat>,
    name: string,
  ): Promise<string> {
    const base = slugify(name);
    let slug = base;

    for (let suffix = 2; await cats.existsBy({ slug }); suffix++) {
      slug = `${base}-${suffix}`;
    }

    return slug;
  }

  private async updatePairing(
    cats: Repository<Cat>,
    cat: Cat,
    pairedCatId: string | null,
  ): Promise<void> {
    if (pairedCatId === null) {
      await this.releaseGroup(cats, cat);
      return;
    }

    const partnerId = pairedCatId.toLowerCase();

    if (partnerId === cat.id) {
      throw coded(
        BadRequestException,
        'A cat cannot be paired with itself',
        CatErrorCode.PAIRED_CAT_SELF,
      );
    }

    const partner = await cats.findOne({ where: { id: partnerId } });

    if (!partner) {
      throw coded(
        NotFoundException,
        `Cat ${partnerId} not found`,
        CatErrorCode.PAIRED_CAT_NOT_FOUND,
      );
    }

    if (partner.status === CatStatus.ADOPTED) {
      throw coded(
        BadRequestException,
        `${partner.name} is already adopted`,
        CatErrorCode.PAIRED_CAT_ADOPTED,
      );
    }

    if (
      cat.adoptionGroupId &&
      partner.adoptionGroupId === cat.adoptionGroupId
    ) {
      return;
    }

    if (partner.adoptionGroupId) {
      const other = await cats.findOne({
        where: {
          adoptionGroupId: partner.adoptionGroupId,
          id: Not(partner.id),
        },
      });

      if (other) {
        throw coded(
          ConflictException,
          `${partner.name} already has a joint adoption with ${other.name}. Separate them first.`,
          CatErrorCode.PAIRED_CAT_TAKEN,
        );
      }
    }

    await this.releaseGroup(cats, cat);

    const adoptionGroupId = randomUUID();
    cat.adoptionGroupId = adoptionGroupId;
    partner.adoptionGroupId = adoptionGroupId;
    await cats.save(partner);
  }

  private async releaseGroup(cats: Repository<Cat>, cat: Cat): Promise<void> {
    if (!cat.adoptionGroupId) {
      return;
    }

    await cats.update(
      { adoptionGroupId: cat.adoptionGroupId, id: Not(cat.id) },
      { adoptionGroupId: null },
    );
    cat.adoptionGroupId = null;
  }
}
