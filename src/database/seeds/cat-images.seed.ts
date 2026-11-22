interface CatImageSeed {
  slug: string;
  source: string;
  altText: string;
}

const single = (
  slug: string,
  name: string,
  source = `${slug}.jpeg`,
): CatImageSeed => ({
  slug,
  source,
  altText: `Fotografia de ${name}`,
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
  }));

export const catImagesSeed: CatImageSeed[] = [
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
  single('bruna', 'Bruna', 'arya.jpeg'),
  single('tango', 'Tango', 'caramelo.jpeg'),
  single('cleo', 'Cleo', 'dana.jpeg'),
  single('toby', 'Toby', 'maia.jpeg'),
];
