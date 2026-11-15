import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CatsService } from './cats.service';
import { AdminCatDetailDto } from './dto/admin-cat-detail.dto';
import { AdminCatsPageDto } from './dto/admin-cats-page.dto';
import { AdminCatsQueryDto } from './dto/admin-cats-query.dto';
import { UpdateCatDto } from './dto/update-cat.dto';

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

  @Get(':id')
  @ApiOperation({ summary: 'Cat details for the back office' })
  @ApiOkResponse({ type: AdminCatDetailDto })
  @ApiNotFoundResponse({ description: 'No cat exists with this id' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<AdminCatDetailDto> {
    return this.catsService.findOneForAdmin(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partially updates a cat from the back office' })
  @ApiOkResponse({ type: AdminCatDetailDto })
  @ApiNotFoundResponse({ description: 'No cat exists with this id' })
  @ApiBadRequestResponse({
    description: 'Invalid id, invalid body or unknown characteristic ids',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCatDto,
  ): Promise<AdminCatDetailDto> {
    return this.catsService.updateForAdmin(id, dto);
  }
}
