
import { FormControl } from '@angular/forms';
import { Income } from '@blockframes/model';
import { FormEntity, FormList } from '@blockframes/utils/form';
import { IncomeForm } from './statement.form';

interface IncomeChange {
  overrides: Income[],
  confirm: string,
}

function createIncomeEditFormControl(changes?: Partial<IncomeChange>) {
  const controls = {
    overrides: FormList.factory(changes?.overrides, (el) => new IncomeForm(el)),
    confirm: new FormControl<string>(changes?.confirm ?? '')
  };
  return controls;
}

type IncomeEditFormControl = ReturnType<typeof createIncomeEditFormControl>;

export class IncomeEditForm extends FormEntity<IncomeEditFormControl> {
  constructor(changes?: Partial<IncomeChange>) {
    super(createIncomeEditFormControl(changes));
  }
}