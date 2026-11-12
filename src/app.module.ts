import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { CatsModule } from './modules/cats/cats.module';
import { CharacteristicsModule } from './modules/characteristics/characteristics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    CatsModule,
    CharacteristicsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
