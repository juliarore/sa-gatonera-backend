import { Repository } from 'typeorm';
import { Cat } from './entities/cat.entity';
import { CatsService } from './cats.service';
import { CatStatus } from './enums';

function buildService() {
  const find = jest.fn().mockResolvedValue([]);
  const service = new CatsService({ find } as unknown as Repository<Cat>);

  return { find, service };
}

describe('CatsService.findPublic', () => {
  it('lists featured cats: available and featured, urgent first, at most 3', async () => {
    const { find, service } = buildService();

    await service.findPublic({ featured: true });

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isFeatured: true, status: CatStatus.AVAILABLE },
        order: { isUrgent: 'DESC', entryDate: 'ASC', name: 'ASC' },
        take: 3,
      }),
    );
  });

  it('never returns more featured cats than the maximum', async () => {
    const { find, service } = buildService();

    await service.findPublic({ featured: true, limit: 10 });
    await service.findPublic({ featured: true, limit: 2 });

    expect(find.mock.calls.map(([options]) => options.take)).toEqual([3, 2]);
  });

  it('lists every available cat when featured is not requested', async () => {
    const { find, service } = buildService();

    await service.findPublic({});
    await service.findPublic({ featured: false, limit: 12 });

    expect(
      find.mock.calls.map(([options]) => [options.where, options.take]),
    ).toEqual([
      [{ status: CatStatus.AVAILABLE }, 50],
      [{ status: CatStatus.AVAILABLE }, 12],
    ]);
  });
});
