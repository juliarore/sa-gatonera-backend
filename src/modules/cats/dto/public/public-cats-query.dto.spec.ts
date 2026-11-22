import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PublicCatsQueryDto } from './public-cats-query.dto';

async function parse(query: Record<string, string>) {
  const dto = plainToInstance(PublicCatsQueryDto, query);
  return { dto, errors: await validate(dto) };
}

describe('PublicCatsQueryDto', () => {
  it('accepts an empty query', async () => {
    expect((await parse({})).errors).toHaveLength(0);
  });

  it('turns the query strings into a boolean and a number', async () => {
    const { dto, errors } = await parse({ featured: 'true', limit: '3' });

    expect(errors).toHaveLength(0);
    expect(dto).toMatchObject({ featured: true, limit: 3 });
  });

  it.each<Record<string, string>>([
    { featured: 'yes' },
    { limit: '0' },
    { limit: '51' },
    { limit: 'abc' },
  ])('rejects %j', async (query) => {
    expect((await parse(query)).errors).not.toHaveLength(0);
  });
});
