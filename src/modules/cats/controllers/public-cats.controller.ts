import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CatsService } from '../cats.service';
import { PublicCatDto, PublicCatsPageDto } from '../dto/public/public-cat.dto';
import { PublicCatsPageQueryDto } from '../dto/public/public-cats-page-query.dto';
import { PublicCatSummaryDto } from '../dto/public/public-cat-summary.dto';
import { PublicCatsQueryDto } from '../dto/public/public-cats-query.dto';

@ApiTags('public cats')
@Controller()
export class PublicCatsController {
  constructor(private readonly catsService: CatsService) {}

  @Get('cats/featured')
  @ApiOperation({
    summary:
      'Exactly 3 available cats for the home page (fewer only if fewer are available): featured ones first, then urgent ones and the longest-waiting.',
  })
  @ApiOkResponse({ type: [PublicCatDto] })
  findFeatured(): Promise<PublicCatDto[]> {
    return this.catsService.findPublicFeatured();
  }

  @Get('cats')
  @ApiOperation({
    summary: 'Paginated catalog of the cats available for adoption.',
  })
  @ApiOkResponse({ type: PublicCatsPageDto })
  findPage(@Query() query: PublicCatsPageQueryDto): Promise<PublicCatsPageDto> {
    return this.catsService.findPublicPage(query);
  }

  @Get('public/cats')
  @ApiOperation({
    deprecated: true,
    summary:
      'Deprecated: use GET /cats and GET /cats/featured. Summaries of the available cats, urgent ones first, then the longest-waiting.',
  })
  @ApiOkResponse({ type: [PublicCatSummaryDto] })
  findAll(@Query() query: PublicCatsQueryDto): Promise<PublicCatSummaryDto[]> {
    return this.catsService.findPublic(query);
  }
}
