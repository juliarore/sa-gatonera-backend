import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cat } from './cat.entity';
import { AdminCatsPageDto } from './dto/admin-cats-page.dto';
import { AdminCatsQueryDto } from './dto/admin-cats-query.dto';
import { CatStatus } from './enums';
import { getAgeGroup, getBirthDateRange } from './utils/age-group';

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
}
