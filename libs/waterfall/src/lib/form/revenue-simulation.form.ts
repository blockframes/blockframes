import { Expense, Income } from '@blockframes/model';
import { FormEntity, FormList } from '@blockframes/utils/form';
import { ExpenseForm, IncomeForm } from './statement.form';
import { FormControl } from '@angular/forms';

interface SimulationConfig {
  fromScratch: FormControl<boolean>,
  date: FormControl<Date>,
  incomes: Income[],
  expenses: Expense[],
}

function createRevenueSimulationFormControl(config?: Partial<SimulationConfig>) {
  const controls = {
    fromScratch: new FormControl(config?.fromScratch ?? true),
    date: new FormControl(new Date()),
    incomes: FormList.factory(config?.incomes, (el) => new IncomeForm(el)),
    expenses: FormList.factory(config?.expenses, (el) => new ExpenseForm(el)),
  };
  return controls;
}

type RevenueSimulationFormControl = ReturnType<typeof createRevenueSimulationFormControl>;

export class RevenueSimulationForm extends FormEntity<RevenueSimulationFormControl> {
  constructor(config?: Partial<SimulationConfig>) {
    super(createRevenueSimulationFormControl(config));
  }
}