import { MovieBudget, createMovieBudget } from '../../+state/movie.model'
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { validRange } from '@blockframes/utils/form/validators/validators'
import { FormControl, FormGroup } from '@angular/forms';

function createBudgetFormControl(entity?: Partial<MovieBudget>) {
  const { totalBudget, budgetCurrency, detailledBudget, range } = createMovieBudget(entity);
  return {
    totalBudget: new FormControl(totalBudget),
    budgetCurrency: new FormControl(budgetCurrency),
    detailledBudget: new FormControl(detailledBudget),
    range: new FormGroup({
      from: new FormControl(range.from),
      to: new FormControl(range.to),
    }, [validRange])
  }
}

type BudgetFormControl = ReturnType<typeof createBudgetFormControl>;

export class MovieBudgetForm extends FormEntity<BudgetFormControl> {
  constructor(budget?: MovieBudget) {
    super(createBudgetFormControl(budget));
  }
}
