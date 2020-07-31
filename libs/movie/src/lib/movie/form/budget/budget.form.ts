
import { NumberRange } from '@blockframes/utils/common-interfaces/range';

export const BUDGET_LIST: NumberRange[] = [
  { from: 0, to: 1000000, label: 'Less than $1 million' },
  { from: 1000000, to: 2000000, label: '$1 - 2 millions' },
  { from: 2000000, to: 3500000, label: '$2 - 3.5 millions' },
  { from: 3500000, to: 5000000, label: '$3.5 - 5 millions' },
  { from: 5000000, to: 10000000, label: '$5 - 10 millions' },
  { from: 10000000, to: 20000000, label: '$10 - 20 millions' },
  { from: 20000000, to: 999999999, label: 'More than $20 millions' },
];
