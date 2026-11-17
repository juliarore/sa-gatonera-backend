import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CharacteristicsService } from './characteristics.service';
import { CharacteristicDto } from './dto/characteristic.dto';

@ApiTags('admin-characteristics')
@Controller('admin/characteristics')
export class AdminCharacteristicsController {
  constructor(
    private readonly characteristicsService: CharacteristicsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Lists all characteristics, ordered by masculine label',
  })
  @ApiOkResponse({ type: [CharacteristicDto] })
  findAll(): Promise<CharacteristicDto[]> {
    return this.characteristicsService.findAll();
  }
}
