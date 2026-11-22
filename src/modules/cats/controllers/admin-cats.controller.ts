import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CatsService } from '../cats.service';
import { AdminCatDetailDto } from '../dto/admin/admin-cat-detail.dto';
import { AdoptionGroupMateDto } from '../dto/admin/adoption-group-mate.dto';
import { AdminCatsPageDto } from '../dto/admin/admin-cats-page.dto';
import { AdminCatsQueryDto } from '../dto/admin/admin-cats-query.dto';
import { CreateCatDto } from '../dto/admin/create-cat.dto';
import { FeaturedSummaryDto } from '../dto/admin/featured-summary.dto';
import { PairedCatOptionsQueryDto } from '../dto/admin/paired-cat-options-query.dto';
import { UpdateCatDto } from '../dto/admin/update-cat.dto';

// TODO: protect this controller with authentication once it is available.
@ApiTags('admin-cats')
@Controller('admin/cats')
export class AdminCatsController {
  constructor(private readonly catsService: CatsService) {}

  @Get()
  @ApiOperation({
    summary:
      'Paginated list of cats for the back office, with search and filters',
  })
  @ApiOkResponse({ type: AdminCatsPageDto })
  findAll(@Query() query: AdminCatsQueryDto): Promise<AdminCatsPageDto> {
    return this.catsService.findForAdmin(query);
  }

  @Get('paired-cat-options')
  @ApiOperation({
    summary:
      'Cats available for joint adoption, ordered by name. With catId, excludes that cat and includes its current paired cat.',
  })
  @ApiOkResponse({ type: [AdoptionGroupMateDto] })
  @ApiNotFoundResponse({
    description: 'catId was sent and no cat exists with it',
  })
  findPairedCatOptions(
    @Query() query: PairedCatOptionsQueryDto,
  ): Promise<AdoptionGroupMateDto[]> {
    return this.catsService.findPairedCatOptions(query.catId);
  }

  @Get('featured-summary')
  @ApiOperation({
    summary:
      'Number of cats currently featured on the home page (available only) and the maximum allowed',
  })
  @ApiOkResponse({ type: FeaturedSummaryDto })
  getFeaturedSummary(): Promise<FeaturedSummaryDto> {
    return this.catsService.getFeaturedSummary();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Cat details for the back office' })
  @ApiOkResponse({ type: AdminCatDetailDto })
  @ApiNotFoundResponse({ description: 'No cat exists with this id' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<AdminCatDetailDto> {
    return this.catsService.findOneForAdmin(id);
  }

  @Post()
  @ApiOperation({ summary: 'Creates a cat from the back office' })
  @ApiCreatedResponse({ type: AdminCatDetailDto })
  @ApiBadRequestResponse({
    description:
      'Invalid body. Business rule errors include a code: UNKNOWN_CHARACTERISTICS, PAIRED_CAT_ADOPTED',
  })
  @ApiConflictResponse({
    description:
      'Business rule errors include a code: FEATURED_LIMIT_REACHED, FEATURED_NOT_AVAILABLE, PAIRED_CAT_TAKEN',
  })
  @ApiNotFoundResponse({
    description: 'The paired cat does not exist (code PAIRED_CAT_NOT_FOUND)',
  })
  create(@Body() dto: CreateCatDto): Promise<AdminCatDetailDto> {
    return this.catsService.createForAdmin(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partially updates a cat from the back office' })
  @ApiOkResponse({ type: AdminCatDetailDto })
  @ApiNotFoundResponse({
    description:
      'No cat exists with this id, or code PAIRED_CAT_NOT_FOUND if the paired cat does not exist',
  })
  @ApiBadRequestResponse({
    description:
      'Invalid id or body. Business rule errors include a code: UNKNOWN_CHARACTERISTICS, PAIRED_CAT_ADOPTED, PAIRED_CAT_SELF',
  })
  @ApiConflictResponse({
    description:
      'Business rule errors include a code: FEATURED_LIMIT_REACHED, FEATURED_NOT_AVAILABLE, PAIRED_CAT_TAKEN',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCatDto,
  ): Promise<AdminCatDetailDto> {
    return this.catsService.updateForAdmin(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    summary:
      'Deletes a cat with its photos and characteristics; its paired cat is left without a group',
  })
  @ApiNoContentResponse({ description: 'Cat deleted' })
  @ApiBadRequestResponse({ description: 'Invalid id' })
  @ApiNotFoundResponse({ description: 'No cat exists with this id' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.catsService.deleteForAdmin(id);
  }
}
