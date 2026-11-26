import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Characteristic } from './characteristic.entity';
import { CharacteristicDto } from './dto/characteristic.dto';
import { PublicCharacteristicDto } from './dto/public-characteristic.dto';

@Injectable()
export class CharacteristicsService {
  constructor(
    @InjectRepository(Characteristic)
    private readonly characteristicsRepository: Repository<Characteristic>,
  ) {}

  async findAll(): Promise<CharacteristicDto[]> {
    return this.characteristicsRepository.find({
      select: {
        id: true,
        code: true,
        labelMasculine: true,
        labelFeminine: true,
      },
      order: { labelMasculine: 'ASC' },
    });
  }

  async findPublic(): Promise<PublicCharacteristicDto[]> {
    const characteristics = await this.findAll();
    return characteristics.map(({ code, labelMasculine }) => ({
      code,
      label: labelMasculine,
    }));
  }
}
