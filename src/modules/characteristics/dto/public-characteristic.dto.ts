import { ApiProperty } from '@nestjs/swagger';

export class PublicCharacteristicDto {
  @ApiProperty({ example: 'affectionate' })
  code: string;

  @ApiProperty({ example: 'Carinyós' })
  label: string;
}
