import { ApiProperty } from '@nestjs/swagger';

export class AdoptionGroupMateDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;
}
