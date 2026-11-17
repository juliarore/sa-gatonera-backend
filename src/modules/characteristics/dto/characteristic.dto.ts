import { ApiProperty } from '@nestjs/swagger';

export class CharacteristicDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'affectionate' })
  code: string;

  @ApiProperty({ example: 'Carinyós' })
  labelMasculine: string;

  @ApiProperty({ example: 'Carinyosa' })
  labelFeminine: string;
}
