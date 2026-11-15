import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Characteristic } from '../characteristics/characteristic.entity';
import { Cat } from './cat.entity';
import { AdminCatDetailDto } from './dto/admin-cat-detail.dto';
import { AdminCatsPageDto } from './dto/admin-cats-page.dto';
import { AdminCatsQueryDto } from './dto/admin-cats-query.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
import { CatGender, CatStatus } from './enums';
import { getAdoptionFee } from './utils/adoption-fee';
import { getAgeGroup, getBirthDateRange } from './utils/age-group';

@Injectable()
export class CatsService {
  constructor(
    @InjectRepository(Cat)
    private readonly catsRepository: Repository<Cat>,
    @InjectRepository(Characteristic)
    private readonly characteristicsRepository: Repository<Characteristic>,
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
      ])
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
      relations: { characteristics: true },
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
    };
  }

  async updateForAdmin(
    id: string,
    dto: UpdateCatDto,
  ): Promise<AdminCatDetailDto> {
    const cat = await this.catsRepository.findOne({ where: { id } });

    if (!cat) {
      throw new NotFoundException(`Cat ${id} not found`);
    }

    const { characteristicIds, ...fields } = dto;
    Object.assign(cat, fields);

    if (characteristicIds !== undefined) {
      const characteristics = characteristicIds.length
        ? await this.characteristicsRepository.findBy({
            id: In(characteristicIds),
          })
        : [];
      const foundIds = new Set(characteristics.map(({ id }) => id));
      const missingIds = characteristicIds.filter(
        (item) => !foundIds.has(item),
      );

      if (missingIds.length > 0) {
        throw new BadRequestException(
          `Unknown characteristic ids: ${missingIds.join(', ')}`,
        );
      }

      cat.characteristics = characteristics;
    }

    await this.catsRepository.save(cat);

    return this.findOneForAdmin(id);
  }
}
