import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Characteristic } from './characteristic.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Characteristic])],
})
export class CharacteristicsModule {}
