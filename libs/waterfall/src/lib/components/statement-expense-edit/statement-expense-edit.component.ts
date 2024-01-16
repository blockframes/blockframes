import { Component, ChangeDetectionStrategy, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Expense, Waterfall } from '@blockframes/model';
import { ExpenseEditForm } from '../../form/expense-edit.form';

interface StatementExpenseChangeData {
  expense: Expense;
  waterfall: Waterfall;
  versionId: string;
  onConfirm?: (expense: Expense) => void
}

@Component({
  selector: 'waterfall-statement-expense-edit',
  templateUrl: './statement-expense-edit.component.html',
  styleUrls: ['./statement-expense-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementExpenseEditComponent implements OnInit {

  public form: ExpenseEditForm;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: StatementExpenseChangeData,
    public dialogRef: MatDialogRef<StatementExpenseEditComponent>
  ) { }

  ngOnInit() {
    const override = this.data.expense;
    this.form = new ExpenseEditForm({ override });
  }

  public restore() {
    this.form.get('override').get('price').setValue(this.data.expense.price);
  }

  public confirm() {
    if (!this.form.valid) return;

    const override = this.form.get('override').value;
    const expense = this.data.expense;
    const price = override?.price;
    if (price === 0) {
      expense.version[this.data.versionId] = { hidden: true, price };
    } else {
      expense.version[this.data.versionId] = { price };
    }

    this.data.onConfirm(expense);
    this.dialogRef.close(true);
  }

  public close() {
    this.dialogRef.close(false);
  }
}
