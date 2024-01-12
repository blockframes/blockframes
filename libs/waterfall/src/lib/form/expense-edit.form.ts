
import { FormControl } from '@angular/forms';
import { Expense } from '@blockframes/model';
import { FormEntity } from '@blockframes/utils/form';
import { ExpenseForm } from './statement.form';

interface ExpenseChange {
  override: Expense,
  confirm: string,
}

function createExpenseEditFormControl(changes?: Partial<ExpenseChange>) {
  const controls = {
    override: new ExpenseForm(changes?.override ?? {}),
    confirm: new FormControl<string>(changes?.confirm ?? '')
  };
  return controls;
}

type ExpenseEditFormControl = ReturnType<typeof createExpenseEditFormControl>;

export class ExpenseEditForm extends FormEntity<ExpenseEditFormControl> {
  constructor(changes?: Partial<ExpenseChange>) {
    super(createExpenseEditFormControl(changes));
  }
}