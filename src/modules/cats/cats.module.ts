import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cat } from './cat.entity';
import { CatImage } from './cat-image.entity';
import { AdminCatsController } from './admin-cats.controller';
import { CatImagesService } from './cat-images.service';
import { CatsService } from './cats.service';
import { PublicCatsController } from './public-cats.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Cat, CatImage])],
  controllers: [AdminCatsController, PublicCatsController],
  providers: [CatsService, CatImagesService],
})
export class CatsModule {}
