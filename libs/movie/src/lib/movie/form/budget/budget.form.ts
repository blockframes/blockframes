import { MovieBudget, createMovieBudget } from '../../+state/movie.model'
import { FormEntity, FormValue, FormList } from '@blockframes/utils/form';
import { FormControl } from '@angular/forms';
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
    boxOffice: FormList.factory(boxOffice, el => new BoxOfficeForm(el))
    // boxOffice: FormList.factory(boxOffice, el => new BoxOfficeForm(el)),
  }
}

export type BudgetFormControl = ReturnType<typeof createBudgetFormControl>;

export class MovieBudgetForm extends FormEntity<BudgetFormControl> {
  constructor(budget?: MovieBudget) {
    super(createBudgetFormControl(budget));
  }
}

// Box Office

function createBoxOfficeFormControl(boxOffice?: Partial<BoxOffice>) {
  const { unit, territory, value } = createBoxOffice(boxOffice);
  return {
    unit: new FormValue(unit),
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
