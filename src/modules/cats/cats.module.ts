import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatImage } from '../cat-images/entities/cat-image.entity';
import { CharacteristicsModule } from '../characteristics/characteristics.module';
import { CatsService } from './cats.service';
import { AdminCatsController } from './controllers/admin-cats.controller';
import { PublicCatsController } from './controllers/public-cats.controller';
import { Cat } from './entities/cat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cat, CatImage]), CharacteristicsModule],
  controllers: [AdminCatsController, PublicCatsController],
  providers: [CatsService],
})
export class CatsModule {}
