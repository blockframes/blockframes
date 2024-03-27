import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { Expense, ExpenseType, MovieCurrency, PricePerCurrency, mainCurrency, sum } from '@blockframes/model';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';
import { StatementForm } from '../../../form/statement.form';
import { Observable, combineLatest, map } from 'rxjs';

const expenseColumns = {
  nature: 'Expenses name',
  '': 'Amount',
  capped: 'Capped',
}

@Component({
  selector: '[form][contractId] waterfall-expense-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpenseFormComponent implements OnInit {

  @Input() contractId: string;
  @Input() form: StatementForm;

  public mainCurrency = mainCurrency;
  public expenseTypes$: Observable<ExpenseType[]>;
  public expenseColumns = expenseColumns;
  public realTimeExpenses$: Observable<Record<string, PricePerCurrency>>;

  constructor(private shell: DashboardWaterfallShellComponent) { }

  ngOnInit() {
    this.expenseTypes$ = this.shell.waterfall$.pipe(
      map(waterfall => waterfall.expenseTypes[this.contractId || 'directSales']),
    );

    this.realTimeExpenses$ = combineLatest([this.expenseTypes$, this.shell.simulation$, this.form.value$]).pipe(
      map(([expenseTypes, simulation, formValue]) => {
        const realTimeExpenses: Record<string, PricePerCurrency> = {};
        expenseTypes.forEach(expenseType => {
          const values: { currency: MovieCurrency, price: number, capped: boolean, id: string }[] = formValue[`expenses-${expenseType.id}`];
          const expenses = Object.values(simulation.waterfall.state.expenses)
            .filter(e => e.typeId === expenseType.id && !values.find(v => v.id === e.id))
            .map(e => e.amount);
          realTimeExpenses[expenseType.id] = { [mainCurrency]: sum(expenses) };

          values?.forEach(value => {
            if (value.capped) {
              if (realTimeExpenses[expenseType.id][value.currency]) {
                realTimeExpenses[expenseType.id][value.currency] += value.price;
              } else {
                realTimeExpenses[expenseType.id][value.currency] = value.price;
              }
            }
          });
        });
        return realTimeExpenses;
      })
    )
  }

  public defaultExpenseValue(expenseType: ExpenseType): Partial<Expense> {
    return { nature: 'Expenses name', capped: expenseType.cap.default > 0 };
  }

}