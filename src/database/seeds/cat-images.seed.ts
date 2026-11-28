import { CatStatus } from '../../modules/cats/enums';
import { catsSeed } from './cats.seed';

interface CatImageSeed {
  slug: string;
  source: string;
  altText: string;
  displayOrder: number;
}

const single = (
  slug: string,
  name: string,
  source = `${slug}.jpeg`,
): CatImageSeed => ({
  slug,
  source,
  altText: `Fotografia de ${name}`,
  displayOrder: 1,
});

const pair = (
  source: string,
  first: [slug: string, name: string],
  second: [slug: string, name: string],
): CatImageSeed[] =>
  [first, second].map(([slug]) => ({
    slug,
    source,
    altText: `Fotografia de ${first[1]} i ${second[1]} junts`,
    displayOrder: 1,
  }));

const coverImages: CatImageSeed[] = [
  ...pair('nala-simba.jpeg', ['nala', 'Nala'], ['simba', 'Simba']),
  ...pair('mario-peach.jpeg', ['mario', 'Mario'], ['peach', 'Peach']),
  ...pair('kael-kira.jpeg', ['kael', 'Kael'], ['kira', 'Kira']),
  ...pair('leia-neo.jpeg', ['leia', 'Leia'], ['neo', 'Neo']),
  ...pair('mimi-blacky.jpeg', ['mimi', 'Mimi'], ['blacky', 'Blacky']),
  single('lluna', 'Lluna'),
  single('kai', 'Kai'),
  single('rayo', 'Rayo'),
  single('shaila', 'Shaila'),
  single('arya', 'Arya'),
  single('caramelo', 'Caramelo'),
  single('dana', 'Dana'),
  single('maia', 'Maia'),
  single('bruna', 'Bruna'),
  single('tango', 'Tango', 'caramelo.jpeg'),
  single('cleo', 'Cleo', 'dana.jpeg'),
  single('toby', 'Toby', 'maia.jpeg'),
];

const individualPhotos = [
  'arya.jpeg',
  'caramelo.jpeg',
  'dana.jpeg',
  'kai.jpeg',
  'lluna.jpeg',
  'maia.jpeg',
  'rayo.jpeg',
  'shaila.jpeg',
  'bruna.jpeg',
];

const photoAt = (position: number) =>
  individualPhotos[position % individualPhotos.length];

const nextPosition = (start: number, excluded: string[]) => {
  let position = start;
  while (excluded.includes(photoAt(position))) {
    position += 1;
  }
  return position;
};

const availableCats = catsSeed
  .flatMap(({ slug, name, status }) =>
    status === CatStatus.AVAILABLE && slug && name ? [{ slug, name }] : [],
  )
  .sort((a, b) => (a.slug < b.slug ? -1 : 1));

const extraImages: CatImageSeed[] = availableCats.flatMap(
  ({ slug, name }, index) => {
    const cover = coverImages.find((image) => image.slug === slug)?.source;
    const excluded = cover ? [cover] : [];
    const step = 1 + Math.floor(index / individualPhotos.length);
    const first = nextPosition(index + 1, excluded);
    const second = nextPosition(first + step, [...excluded, photoAt(first)]);
    const third = nextPosition(second + step, [
      ...excluded,
      photoAt(first),
      photoAt(second),
    ]);

    return [first, second, third].map((position, extraIndex) => ({
      slug,
      source: photoAt(position),
      altText: `Fotografia de ${name} (${extraIndex + 2})`,
      displayOrder: extraIndex + 2,
    }));
  },
);

export const catImagesSeed: CatImageSeed[] = [...coverImages, ...extraImages];
