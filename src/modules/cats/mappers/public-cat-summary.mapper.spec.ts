import { Characteristic } from '../../characteristics/characteristic.entity';
import { CatImage } from '../../cat-images/entities/cat-image.entity';
import { Cat } from '../entities/cat.entity';
import { CatGender, Compatibility } from '../enums';
import { toPublicCatSummaryDto } from './public-cat-summary.mapper';

function buildCat(overrides: Partial<Cat> = {}): Cat {
  return {
    id: 'a1',
    name: 'Nala',
    slug: 'nala',
    gender: CatGender.FEMALE,
    story: 'Private story',
    healthStatus: 'Internal notes',
    specialNeeds: 'Internal needs',
    entryDate: '2026-01-01',
    birthDate: '2026-09-01',
    birthDateIsEstimated: true,
    adoptionGroupId: null,
    isUrgent: true,
    isFeatured: true,
    compatibleWithCats: Compatibility.YES,
    compatibleWithDogs: Compatibility.NO,
    compatibleWithChildren: Compatibility.UNKNOWN,
    characteristics: [
      {
        id: 'c2',
        code: 'playful',
        labelMasculine: 'Juganer',
        labelFeminine: 'Juganera',
      },
      {
        id: 'c1',
        code: 'affectionate',
        labelMasculine: 'Carinyós',
        labelFeminine: 'Carinyosa',
      },
    ] as Characteristic[],
    images: [
      { displayOrder: 2, imageUrl: '/uploads/cats/b.jpg', altText: 'second' },
      { displayOrder: 1, imageUrl: '/uploads/cats/a.jpg', altText: 'cover' },
    ] as CatImage[],
    ...overrides,
  } as Cat;
}

describe('toPublicCatSummaryDto', () => {
  it('only exposes the fields the public card needs', () => {
    expect(Object.keys(toPublicCatSummaryDto(buildCat())).sort()).toEqual([
      'birthDate',
      'characteristics',
      'compatibleWithCats',
      'compatibleWithChildren',
      'compatibleWithDogs',
      'coverImageAlt',
      'coverImageUrl',
      'gender',
      'isJointAdoption',
      'isUrgent',
      'name',
      'slug',
    ]);
  });

  it('never leaks private or location data in the public JSON', () => {
    const json = JSON.stringify(
      toPublicCatSummaryDto(buildCat({ adoptionGroupId: 'group-secret' })),
    );

    for (const privateKey of [
      'healthStatus',
      'specialNeeds',
      'story',
      'adoptionGroupId',
      'location',
      'address',
      'latitude',
      'longitude',
    ]) {
      expect(json).not.toContain(`"${privateKey}"`);
    }
    for (const privateValue of [
      'Private story',
      'Internal notes',
      'Internal needs',
      'group-secret',
    ]) {
      expect(json).not.toContain(privateValue);
    }
  });

  it('labels characteristics by gender, sorted alphabetically', () => {
    const labels = (cat: Cat) =>
      toPublicCatSummaryDto(cat).characteristics.map(({ label }) => label);

    expect(labels(buildCat())).toEqual(['Carinyosa', 'Juganera']);
    expect(labels(buildCat({ gender: CatGender.MALE }))).toEqual([
      'Carinyós',
      'Juganer',
    ]);
  });

  it('flags joint adoption without exposing the group id', () => {
    const dto = toPublicCatSummaryDto(buildCat({ adoptionGroupId: 'g1' }));

    expect(dto.isJointAdoption).toBe(true);
    expect(dto).not.toHaveProperty('adoptionGroupId');
    expect(toPublicCatSummaryDto(buildCat()).isJointAdoption).toBe(false);
  });

  it('uses the first image as cover, or null when there are none', () => {
    expect(toPublicCatSummaryDto(buildCat())).toMatchObject({
      coverImageUrl: '/uploads/cats/a.jpg',
      coverImageAlt: 'cover',
    });
    expect(toPublicCatSummaryDto(buildCat({ images: [] }))).toMatchObject({
      coverImageUrl: null,
      coverImageAlt: null,
    });
  });
});
