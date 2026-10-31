import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CatsService } from './cats.service';
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
}
