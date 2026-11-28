import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CharacteristicsService } from '../../characteristics/characteristics.service';
import { PublicCharacteristicDto } from '../../characteristics/dto/public-characteristic.dto';
import { CatsService } from '../cats.service';
import { PublicCatDetailDto } from '../dto/public/public-cat-detail.dto';
import { PublicCatDto, PublicCatsPageDto } from '../dto/public/public-cat.dto';
import { PublicCatsPageQueryDto } from '../dto/public/public-cats-page-query.dto';

@ApiTags('public cats')
@Controller('cats')
export class PublicCatsController {
  constructor(
    private readonly catsService: CatsService,
    private readonly characteristicsService: CharacteristicsService,
  ) {}

  @Get('characteristics')
  @ApiOperation({
    summary:
      'Characteristics that can be used to filter the catalog, ordered by label.',
  })
  @ApiOkResponse({ type: [PublicCharacteristicDto] })
  findCharacteristics(): Promise<PublicCharacteristicDto[]> {
    return this.characteristicsService.findPublic();
  }

  @Get('featured')
  @ApiOperation({
    summary:
      'Exactly 3 available cats for the home page (fewer only if fewer are available): featured ones first, then urgent ones and the longest-waiting.',
  })
  @ApiOkResponse({ type: [PublicCatDto] })
  findFeatured(): Promise<PublicCatDto[]> {
    return this.catsService.findPublicFeatured();
  }

  @Get()
  @ApiOperation({
    summary: 'Paginated catalog of the cats available for adoption.',
  })
  @ApiOkResponse({ type: PublicCatsPageDto })
  findPage(@Query() query: PublicCatsPageQueryDto): Promise<PublicCatsPageDto> {
    return this.catsService.findPublicPage(query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Detail of a cat available for adoption.' })
  @ApiOkResponse({ type: PublicCatDetailDto })
  @ApiNotFoundResponse({
    description: 'No available cat exists with this slug',
  })
  findOne(@Param('slug') slug: string): Promise<PublicCatDetailDto> {
    return this.catsService.findPublicBySlug(slug);
  }
}
