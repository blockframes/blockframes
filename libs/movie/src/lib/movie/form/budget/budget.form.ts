import { FormEntity, FormValue, FormList } from '@blockframes/utils/form';
import { FormControl, Validators } from '@angular/forms';
import { BoxOffice } from '../../+state/movie.firestore';
import { NumberRange } from '@blockframes/utils/common-interfaces/range';
import { PriceForm } from '@blockframes/contract/version/form/price/price.form';
import { Movie, createMovie } from '@blockframes/movie/+state';

export const BUDGET_LIST: NumberRange[] = [
  { from: 0, to: 1000000, label: 'Less than $1 million' },
  { from: 1000000, to: 2000000, label: '$1 - 2 millions' },
  { from: 2000000, to: 3500000, label: '$2 - 3.5 millions' },
  { from: 3500000, to: 5000000, label: '$3.5 - 5 millions' },
  { from: 5000000, to: 10000000, label: '$5 - 10 millions' },
  { from: 10000000, to: 20000000, label: '$10 - 20 millions' },
  { from: 20000000, to: 999999999, label: 'More than $20 millions' },
];

// Box Office

function createBoxOfficeFormControl(boxOffice?: Partial<BoxOffice>) {
  const { unit, territory, value } = createBoxOffice(boxOffice);
  return {
    unit: new FormValue(unit),
    territory: new FormControl(territory),
    value: new FormControl(value, Validators.min(0))
  }
}

type BoxOfficeFormControl = ReturnType<typeof createBoxOfficeFormControl>;

export class BoxOfficeForm extends FormEntity<BoxOfficeFormControl> {
  constructor(boxOffice?: Partial<BoxOffice>) {
    super(createBoxOfficeFormControl(boxOffice))
  }
}

export function createBoxOffice(params: Partial<BoxOffice> = {}): BoxOffice {
  return {
    unit: 'boxoffice_dollar',
    value: 0,
    territory: null,
    ...params,
  }
}
