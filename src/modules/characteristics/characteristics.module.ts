import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminCharacteristicsController } from './admin-characteristics.controller';
import { Characteristic } from './characteristic.entity';
import { CharacteristicsService } from './characteristics.service';

@Module({
  imports: [TypeOrmModule.forFeature([Characteristic])],
  controllers: [AdminCharacteristicsController],
  providers: [CharacteristicsService],
  exports: [CharacteristicsService],
})
export class CharacteristicsModule {}
