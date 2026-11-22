import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cat } from '../cats/entities/cat.entity';
import { CatImagesController } from './cat-images.controller';
import { CatImagesService } from './cat-images.service';
import { CatImage } from './entities/cat-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cat, CatImage])],
  controllers: [CatImagesController],
  providers: [CatImagesService],
})
export class CatImagesModule {}
