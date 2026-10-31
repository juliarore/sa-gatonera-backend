import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cat } from './cat.entity';
import { CatStatus } from './enums';

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
}
