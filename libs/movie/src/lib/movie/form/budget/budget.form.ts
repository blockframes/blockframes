import { MovieBudget, createMovieBudget } from '../../+state/movie.model'
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { NumberRangeForm } from '@blockframes/utils/form/forms/range.form';
import { FormControl } from '@angular/forms';

function createBudgetFormControl(entity?: Partial<MovieBudget>) {
  const { totalBudget, budgetCurrency, detailledBudget, range } = createMovieBudget(entity);
  return {
    totalBudget: new FormControl(totalBudget),
    budgetCurrency: new FormControl(budgetCurrency),
    detailledBudget: new FormControl(detailledBudget),
    range: new NumberRangeForm(range)
  }
}

type BudgetFormControl = ReturnType<typeof createBudgetFormControl>;

export class MovieBudgetForm extends FormEntity<BudgetFormControl> {
  constructor(budget?: MovieBudget) {
    super(createBudgetFormControl(budget));
  }
}
