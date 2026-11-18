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
  UploadedFile,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  CatImagesService,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_MB,
  MAX_IMAGES_PER_CAT,
  UploadedImage,
} from './cat-images.service';
import { CatsService } from './cats.service';
import {
  AdminCatDetailDto,
  AdoptionGroupMateDto,
  CatImageDto,
} from './dto/admin-cat-detail.dto';
import { AdminCatsPageDto } from './dto/admin-cats-page.dto';
import { AdminCatsQueryDto } from './dto/admin-cats-query.dto';
import { CatImageAltTextDto } from './dto/cat-image-alt-text.dto';
import { CatImagePositionDto } from './dto/cat-image-position.dto';
import { CreateCatImageDto } from './dto/create-cat-image.dto';
import { CreateCatDto } from './dto/create-cat.dto';
import { FeaturedSummaryDto } from './dto/featured-summary.dto';
import { PairedCatOptionsQueryDto } from './dto/paired-cat-options-query.dto';
import { ALT_TEXT_MAX_LENGTH, ALT_TEXT_MIN_LENGTH } from './dto/cat-validators';
import { UpdateCatDto } from './dto/update-cat.dto';
import { ImageTooLargeFilter } from './filters/image-too-large.filter';

// TODO: protect this controller with authentication once it is available.
@ApiTags('admin-cats')
@Controller('admin/cats')
export class AdminCatsController {
  constructor(
    private readonly catsService: CatsService,
    private readonly catImagesService: CatImagesService,
  ) {}

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

  @Post(':id/images')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_IMAGE_BYTES },
    }),
  )
  @UseFilters(ImageTooLargeFilter)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: `JPEG, PNG or WebP image, up to ${MAX_IMAGE_MB} MB`,
        },
        altText: {
          type: 'string',
          minLength: ALT_TEXT_MIN_LENGTH,
          maxLength: ALT_TEXT_MAX_LENGTH,
          description:
            'Optional. If empty or missing, it is generated from the cat name.',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Uploads a photo of a cat' })
  @ApiCreatedResponse({ type: CatImageDto })
  @ApiBadRequestResponse({
    description:
      'Missing file, unsupported type (only JPEG, PNG and WebP), file larger than 8 MB or invalid altText',
  })
  @ApiNotFoundResponse({ description: 'No cat exists with this id' })
  @ApiConflictResponse({
    description: `The cat already has ${MAX_IMAGES_PER_CAT} photos (code IMAGE_LIMIT_REACHED)`,
  })
  addImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: UploadedImage | undefined,
    @Body() dto: CreateCatImageDto,
  ): Promise<CatImageDto> {
    return this.catImagesService.add(id, file, dto.altText);
  }

  @Patch(':id/images/:imageId')
  @ApiOperation({ summary: 'Updates the alternative text of a photo' })
  @ApiOkResponse({ type: CatImageDto })
  @ApiBadRequestResponse({ description: 'Invalid ids or altText' })
  @ApiNotFoundResponse({
    description: 'The cat does not exist or the photo does not belong to it',
  })
  updateImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
    @Body() dto: CatImageAltTextDto,
  ): Promise<CatImageDto> {
    return this.catImagesService.updateAltText(id, imageId, dto.altText);
  }

  @Patch(':id/images/:imageId/position')
  @ApiOperation({
    summary:
      'Moves a photo to a position; the others are reordered without gaps',
  })
  @ApiOkResponse({ type: [CatImageDto] })
  @ApiBadRequestResponse({
    description: 'Invalid ids or position out of range',
  })
  @ApiNotFoundResponse({
    description: 'The cat does not exist or the photo does not belong to it',
  })
  moveImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
    @Body() dto: CatImagePositionDto,
  ): Promise<CatImageDto[]> {
    return this.catImagesService.move(id, imageId, dto.position);
  }

  @Delete(':id/images/:imageId')
  @HttpCode(204)
  @ApiOperation({
    summary:
      'Deletes a photo and its file; the others are reordered without gaps',
  })
  @ApiNoContentResponse({ description: 'Photo deleted' })
  @ApiNotFoundResponse({
    description: 'The cat does not exist or the photo does not belong to it',
  })
  removeImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ): Promise<void> {
    return this.catImagesService.remove(id, imageId);
  }
}
