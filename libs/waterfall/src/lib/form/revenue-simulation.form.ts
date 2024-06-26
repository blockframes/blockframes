
import { FormControl } from '@angular/forms';
import { Expense, Income } from '@blockframes/model';
import { FormEntity, FormList } from '@blockframes/utils/form';
import { ExpenseForm, IncomeForm } from './statement.form';

interface SimulationConfig {
  date: Date,
  incomes: Income[],
  expenses: Expense[],
}

function createRevenueSimulationFormControl(config?: Partial<SimulationConfig>) {
  const controls = {
    date: new FormControl<Date>(config?.date ?? new Date()),
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