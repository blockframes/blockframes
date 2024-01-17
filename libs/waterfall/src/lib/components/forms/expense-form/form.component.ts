import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { Expense, ExpenseType } from '@blockframes/model';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';
import { StatementForm } from '../../../form/statement.form';
import { Observable, map } from 'rxjs';

const expenseColumns = {
  nature: 'Nature',
  '': 'Price',
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

  public simulation$ = this.shell.simulation$;
  public expenseTypes$: Observable<ExpenseType[]>;
  public expenseColumns = expenseColumns;

  constructor(private shell: DashboardWaterfallShellComponent) { }

  ngOnInit() {
    this.expenseTypes$ = this.shell.waterfall$.pipe(
      map(waterfall => waterfall.expenseTypes[this.contractId || 'directSales']),
    );
  }

  public defaultExpenseValue(expenseType: ExpenseType): Partial<Expense> {
    return { nature: 'Nature', capped: expenseType.cap.default > 0 };
  }

}