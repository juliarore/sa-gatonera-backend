import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cat } from './cat.entity';
import { CatImage } from './cat-image.entity';
import { AdminCatsController } from './admin-cats.controller';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cat, CatImage])],
  controllers: [CatsController, AdminCatsController],
  providers: [CatsService],
})
export class CatsModule {}
