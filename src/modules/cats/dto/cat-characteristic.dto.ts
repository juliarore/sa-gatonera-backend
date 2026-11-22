import { ApiProperty } from '@nestjs/swagger';

export class CatCharacteristicDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'affectionate' })
  code: string;

  @ApiProperty({
    example: 'Carinyosa',
    description: "Label matching the cat's gender",
  })
  label: string;
}
