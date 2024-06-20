import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { Expense, ExpenseType, sum } from '@blockframes/model';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';
import { StatementForm } from '../../../form/statement.form';
import { Observable, combineLatest, map } from 'rxjs';

const expenseColumns = {
  nature: $localize`Expenses name`,
  '': $localize`Amount`,
  capped: $localize`Capped`,
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

  public expenseTypes$: Observable<ExpenseType[]>;
  public expenseColumns = expenseColumns;
  public realTimeExpenses$: Observable<Record<string, number>>;
  public i18nStrings = { yes: $localize`Yes`, no: $localize`No` };
  public waterfall = this.shell.waterfall;
  
  constructor(private shell: DashboardWaterfallShellComponent) { }

  ngOnInit() {
    this.expenseTypes$ = this.shell.waterfall$.pipe(
      map(waterfall => waterfall.expenseTypes[this.contractId || 'directSales']),
    );

    this.realTimeExpenses$ = combineLatest([this.expenseTypes$, this.shell.simulation$, this.form.value$]).pipe(
      map(([expenseTypes, simulation, formValue]) => {
        const realTimeExpenses: Record<string, number> = {};
        expenseTypes.forEach(expenseType => {
          const values: { price: number, capped: boolean, id: string }[] = formValue[`expenses-${expenseType.id}`];
          const expenses = Object.values(simulation.waterfall.state.expenses)
            .filter(e => e.typeId === expenseType.id && !values.find(v => v.id === e.id))
            .map(e => e.amount);
          realTimeExpenses[expenseType.id] = sum(expenses);

          values?.forEach(value => {
            if (value.capped) {
              if (realTimeExpenses[expenseType.id]) {
                realTimeExpenses[expenseType.id] += value.price;
              } else {
                realTimeExpenses[expenseType.id] = value.price;
              }
            }
          });
        });
        return realTimeExpenses;
      })
    )
  }

  public defaultExpenseValue(expenseType: ExpenseType): Partial<Expense> {
    return { nature: $localize`Expenses name`, capped: expenseType.cap.default > 0 };
  }

}