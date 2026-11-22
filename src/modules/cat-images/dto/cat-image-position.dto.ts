import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class CatImagePositionDto {
  @ApiProperty({
    minimum: 1,
    description: 'New position, from 1 to the number of images of the cat',
  })
  @IsInt()
  @Min(1)
  position: number;
}
