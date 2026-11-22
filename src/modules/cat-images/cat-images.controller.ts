import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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
import { CatImagesService } from './cat-images.service';
import { CatImageAltTextDto } from './dto/cat-image-alt-text.dto';
import { CatImagePositionDto } from './dto/cat-image-position.dto';
import { CatImageDto } from './dto/cat-image.dto';
import { CreateCatImageDto } from './dto/create-cat-image.dto';
import { ImageTooLargeFilter } from './filters/image-too-large.filter';
import { UploadedImage } from './types/uploaded-image.type';
import {
  ALT_TEXT_MAX_LENGTH,
  ALT_TEXT_MIN_LENGTH,
} from './constants/alt-text.constants';
import {
  MAX_IMAGES_PER_CAT,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_MB,
} from './constants/image-limits.constants';

// TODO: protect this controller with authentication once it is available.
@ApiTags('admin-cats')
@Controller('admin/cats/:id/images')
export class CatImagesController {
  constructor(private readonly catImagesService: CatImagesService) {}

  @Post()
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
  add(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: UploadedImage | undefined,
    @Body() dto: CreateCatImageDto,
  ): Promise<CatImageDto> {
    return this.catImagesService.add(id, file, dto.altText);
  }

  @Patch(':imageId')
  @ApiOperation({ summary: 'Updates the alternative text of a photo' })
  @ApiOkResponse({ type: CatImageDto })
  @ApiBadRequestResponse({ description: 'Invalid ids or altText' })
  @ApiNotFoundResponse({
    description: 'The cat does not exist or the photo does not belong to it',
  })
  updateAltText(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
    @Body() dto: CatImageAltTextDto,
  ): Promise<CatImageDto> {
    return this.catImagesService.updateAltText(id, imageId, dto.altText);
  }

  @Patch(':imageId/position')
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
  move(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
    @Body() dto: CatImagePositionDto,
  ): Promise<CatImageDto[]> {
    return this.catImagesService.move(id, imageId, dto.position);
  }

  @Delete(':imageId')
  @HttpCode(204)
  @ApiOperation({
    summary:
      'Deletes a photo and its file; the others are reordered without gaps',
  })
  @ApiNoContentResponse({ description: 'Photo deleted' })
  @ApiNotFoundResponse({
    description: 'The cat does not exist or the photo does not belong to it',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ): Promise<void> {
    return this.catImagesService.remove(id, imageId);
  }
}
