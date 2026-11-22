import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CatsService } from '../cats.service';
import { PublicCatSummaryDto } from '../dto/public/public-cat-summary.dto';
import { PublicCatsQueryDto } from '../dto/public/public-cats-query.dto';

@ApiTags('public cats')
@Controller('public/cats')
export class PublicCatsController {
  constructor(private readonly catsService: CatsService) {}

  @Get()
  @ApiOperation({
    summary:
      'Summaries of the cats available for adoption, urgent ones first, then the longest-waiting. With featured=true, only the cats featured on the home page.',
  })
  @ApiOkResponse({ type: [PublicCatSummaryDto] })
  findAll(@Query() query: PublicCatsQueryDto): Promise<PublicCatSummaryDto[]> {
    return this.catsService.findPublic(query);
  }
}
