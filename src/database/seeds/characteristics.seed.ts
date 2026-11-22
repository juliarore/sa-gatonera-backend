import { Characteristic } from '../../modules/characteristics/characteristic.entity';

export const characteristicsSeed: Partial<Characteristic>[] = [
  {
    code: 'affectionate',
    labelMasculine: 'Carinyós',
    labelFeminine: 'Carinyosa',
  },
  { code: 'sociable', labelMasculine: 'Sociable', labelFeminine: 'Sociable' },
  {
    code: 'independent',
    labelMasculine: 'Independent',
    labelFeminine: 'Independent',
  },
  { code: 'playful', labelMasculine: 'Juganer', labelFeminine: 'Juganera' },
  { code: 'curious', labelMasculine: 'Curiós', labelFeminine: 'Curiosa' },
  { code: 'shy', labelMasculine: 'Tímid', labelFeminine: 'Tímida' },
  {
    code: 'mischievous',
    labelMasculine: 'Entremaliat',
    labelFeminine: 'Entremaliada',
  },
  { code: 'docile', labelMasculine: 'Dòcil', labelFeminine: 'Dòcil' },
  { code: 'dominant', labelMasculine: 'Dominant', labelFeminine: 'Dominant' },
  { code: 'submissive', labelMasculine: 'Submís', labelFeminine: 'Submisa' },
  {
    code: 'territorial',
    labelMasculine: 'Territorial',
    labelFeminine: 'Territorial',
  },
  { code: 'fearful', labelMasculine: 'Poregós', labelFeminine: 'Poregosa' },
];

export const catCharacteristicsSeed: Record<string, string[]> = {
  nala: ['playful', 'curious', 'mischievous', 'affectionate'],
  simba: ['mischievous', 'playful'],
  mario: ['playful', 'curious', 'dominant', 'sociable'],
  peach: ['shy', 'affectionate', 'submissive', 'playful'],
  kai: ['docile', 'affectionate', 'sociable'],
  lluna: ['curious', 'affectionate', 'independent'],
  rayo: ['affectionate', 'sociable', 'territorial', 'playful'],
  shaila: ['curious', 'playful', 'sociable'],
  arya: ['independent', 'curious', 'shy'],
  caramelo: ['playful', 'affectionate', 'sociable', 'mischievous'],
  dana: ['shy', 'curious'],
  maia: ['sociable', 'docile', 'affectionate', 'curious'],
  kael: ['mischievous', 'playful', 'dominant'],
  kira: ['affectionate', 'shy', 'submissive', 'playful'],
  leia: ['docile', 'affectionate', 'sociable'],
  neo: ['shy', 'affectionate', 'docile'],
  mimi: ['playful', 'curious', 'affectionate'],
  blacky: ['independent', 'mischievous', 'curious'],
  bruna: ['independent', 'territorial', 'dominant'],
  tango: ['docile', 'affectionate', 'sociable'],
  cleo: ['shy', 'curious', 'playful'],
  toby: ['affectionate', 'playful', 'sociable'],
};
