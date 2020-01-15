import { MovieBudget, createMovieBudget } from '../../+state/movie.model'
import { FormEntity, FormList } from '@blockframes/utils';
import { FormControl, FormGroup } from '@angular/forms';
import { BoxOffice } from '../../+state/movie.firestore';
import { createBoxOffice } from '../../+state/movie.model';

function createBudgetFormControl(entity?: Partial<MovieBudget>) {
  const { totalBudget, budgetCurrency, detailledBudget, estimatedBudget, boxOffice } = createMovieBudget(entity);
  return {
    totalBudget: new FormControl(totalBudget),
    budgetCurrency: new FormControl(budgetCurrency),
    detailledBudget: new FormControl(detailledBudget),
    // We use FormControl because objet { from, to } is one value (cannot update separately)
    estimatedBudget: new FormControl(estimatedBudget),
    boxOffice: new FormGroup({
      unit: new FormControl(boxOffice.unit),
      value: new FormControl(boxOffice.value),
      territory: new FormControl(boxOffice.territory),
    }),
    // boxOffice: FormList.factory(boxOffice, el => new BoxOfficeForm(el)),
  }
}

type BudgetFormControl = ReturnType<typeof createBudgetFormControl>;

export class MovieBudgetForm extends FormEntity<BudgetFormControl> {
  constructor(budget?: MovieBudget) {
    super(createBudgetFormControl(budget));
  }
}

// Box Office

function createBoxOfficeFormControl(boxOffice?: Partial<BoxOffice>) {
  const { unit, territory, value } = createBoxOffice(boxOffice);
  return {
    unit: new FormControl(unit),
    territory: new FormControl(territory),
    value: new FormControl(value)
  }
}

type BoxOfficeFormControl = ReturnType<typeof createBoxOfficeFormControl>;

export class BoxOfficeForm extends FormEntity<BoxOfficeFormControl> {
  constructor(boxOffice?: Partial<BoxOffice>) {
    super(createBoxOfficeFormControl(boxOffice))
  }
}
