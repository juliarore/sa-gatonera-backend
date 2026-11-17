import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { In, IsNull, Not, Repository } from 'typeorm';
import { Characteristic } from '../characteristics/characteristic.entity';
import { Cat } from './cat.entity';
import {
  AdminCatDetailDto,
  AdoptionGroupMateDto,
} from './dto/admin-cat-detail.dto';
import { AdminCatsPageDto } from './dto/admin-cats-page.dto';
import { AdminCatsQueryDto } from './dto/admin-cats-query.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
import { CatErrorCode, CatGender, CatStatus } from './enums';
import { getAdoptionFee } from './utils/adoption-fee';
import { getAgeGroup, getBirthDateRange } from './utils/age-group';

const MAX_FEATURED_CATS = 3;

@Injectable()
export class CatsService {
  constructor(
    @InjectRepository(Cat)
    private readonly catsRepository: Repository<Cat>,
  ) {}

  findAvailable(): Promise<Cat[]> {
    return this.catsRepository.find({
      where: { status: CatStatus.AVAILABLE },
      order: { isUrgent: 'DESC', entryDate: 'ASC' },
    });
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
        'cat.status',
        'cat.isUrgent',
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
        entryDate: cat.entryDate,
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

    const characteristics = cat.characteristics
      .map((characteristic) => ({
        id: characteristic.id,
        code: characteristic.code,
        label:
          cat.gender === CatGender.FEMALE
            ? characteristic.labelFeminine
            : characteristic.labelMasculine,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'ca'));

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
      ageGroup: getAgeGroup(cat.birthDate),
      isVisible: cat.status === CatStatus.AVAILABLE,
      adoptionGroupMates: adoptionGroupMates.map(({ id, name }) => ({
        id,
        name,
      })),
      characteristics,
      images: cat.images.map(({ id, imageUrl, altText, displayOrder }) => ({
        id,
        imageUrl,
        altText,
        displayOrder,
      })),
    };
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

      if (fields.isFeatured === true && !cat.isFeatured) {
        const featured = await cats.countBy({
          isFeatured: true,
          id: Not(id),
        });

        if (featured >= MAX_FEATURED_CATS) {
          throw new ConflictException({
            statusCode: 409,
            message: `Only ${MAX_FEATURED_CATS} cats can be featured on the home page. Remove one before adding another.`,
            code: CatErrorCode.FEATURED_LIMIT_REACHED,
          });
        }
      }

      Object.assign(cat, fields);

      if (characteristicIds !== undefined) {
        const characteristics = await manager
          .getRepository(Characteristic)
          .findBy({ id: In(characteristicIds) });
        const foundIds = new Set(characteristics.map(({ id }) => id));
        const missingIds = characteristicIds.filter(
          (item) => !foundIds.has(item),
        );

        if (missingIds.length > 0) {
          throw new BadRequestException({
            statusCode: 400,
            message: `Unknown characteristic ids: ${missingIds.join(', ')}`,
            code: CatErrorCode.UNKNOWN_CHARACTERISTICS,
          });
        }

        cat.characteristics = characteristics;
      }

      if (pairedCatId !== undefined) {
        await this.updatePairing(cats, cat, pairedCatId);
      }

      await cats.save(cat);
    });

    return this.findOneForAdmin(id);
  }

  async findPairedCatOptions(id: string): Promise<AdoptionGroupMateDto[]> {
    const cat = await this.catsRepository.findOne({ where: { id } });

    if (!cat) {
      throw new NotFoundException(`Cat ${id} not found`);
    }

    const candidate = { id: Not(id), status: Not(CatStatus.ADOPTED) };

    return this.catsRepository.find({
      select: { id: true, name: true },
      where: [
        { ...candidate, adoptionGroupId: IsNull() },
        { ...candidate, adoptionGroupId: cat.adoptionGroupId ?? IsNull() },
      ],
      order: { name: 'ASC' },
    });
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
      throw new BadRequestException({
        statusCode: 400,
        message: 'A cat cannot be paired with itself',
        code: CatErrorCode.PAIRED_CAT_SELF,
      });
    }

    const partner = await cats.findOne({ where: { id: partnerId } });

    if (!partner) {
      throw new NotFoundException({
        statusCode: 404,
        message: `Cat ${partnerId} not found`,
        code: CatErrorCode.PAIRED_CAT_NOT_FOUND,
      });
    }

    if (partner.status === CatStatus.ADOPTED) {
      throw new BadRequestException({
        statusCode: 400,
        message: `${partner.name} is already adopted`,
        code: CatErrorCode.PAIRED_CAT_ADOPTED,
      });
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
        throw new ConflictException({
          statusCode: 409,
          message: `${partner.name} already has a joint adoption with ${other.name}. Separate them first.`,
          code: CatErrorCode.PAIRED_CAT_TAKEN,
        });
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

    const mates = await cats.findBy({
      adoptionGroupId: cat.adoptionGroupId,
      id: Not(cat.id),
    });

    for (const mate of mates) {
      mate.adoptionGroupId = null;
    }

    await cats.save(mates);
    cat.adoptionGroupId = null;
  }
}
