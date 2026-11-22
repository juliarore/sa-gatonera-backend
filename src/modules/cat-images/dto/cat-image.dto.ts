import { ApiProperty } from '@nestjs/swagger';

export class CatImageDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({
    example: '/uploads/cats/nala.jpeg',
    description: 'Relative URL of the image',
  })
  imageUrl: string;

  @ApiProperty()
  altText: string;

  @ApiProperty({ minimum: 1, description: 'Display order, 1 is the cover' })
  displayOrder: number;
}
