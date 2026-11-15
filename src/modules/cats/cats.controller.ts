import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Cat } from './cat.entity';
import { CatsService } from './cats.service';

@ApiTags('cats')
@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Get()
  @ApiOperation({
    summary:
      'Lists available cats, urgent ones first, then the longest-waiting',
  })
  findAll(): Promise<Cat[]> {
    return this.catsService.findAvailable();
  }
}
