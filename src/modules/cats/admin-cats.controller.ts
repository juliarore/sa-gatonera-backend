import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CatsService } from './cats.service';
import { AdminCatDetailDto } from './dto/admin-cat-detail.dto';
import { AdminCatsPageDto } from './dto/admin-cats-page.dto';
import { AdminCatsQueryDto } from './dto/admin-cats-query.dto';

// TODO: protegir aquest controller amb autenticació quan estigui disponible.
@ApiTags('admin-cats')
@Controller('admin/cats')
export class AdminCatsController {
  constructor(private readonly catsService: CatsService) {}

  @Get()
  @ApiOperation({
    summary: 'Llista paginada de gats per al backoffice, amb cerca i filtres',
  })
  @ApiOkResponse({ type: AdminCatsPageDto })
  findAll(@Query() query: AdminCatsQueryDto): Promise<AdminCatsPageDto> {
    return this.catsService.findForAdmin(query);
  }

  @Get(':id')
  @ApiOperation({ summary: "Detall d'un gat per al backoffice" })
  @ApiOkResponse({ type: AdminCatDetailDto })
  @ApiNotFoundResponse({ description: 'No existeix cap gat amb aquest id' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<AdminCatDetailDto> {
    return this.catsService.findOneForAdmin(id);
  }
}
