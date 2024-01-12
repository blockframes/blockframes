import { Component, ChangeDetectionStrategy, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Income, Waterfall, getAssociatedSource } from '@blockframes/model';
import { IncomeEditForm } from '@blockframes/waterfall/form/income-edit.form';

interface StatementIncomeChangeData {
  incomes: Income[];
  waterfall: Waterfall;
  versionId: string;
  onConfirm?: (incomes: Income[]) => void
}

@Component({
  selector: 'waterfall-statement-income-edit',
  templateUrl: './statement-income-edit.component.html',
  styleUrls: ['./statement-income-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementIncomeEditComponent implements OnInit {

  public form: IncomeEditForm;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: StatementIncomeChangeData,
    public dialogRef: MatDialogRef<StatementIncomeEditComponent>
  ) { }

  ngOnInit() {
    const overrides = this.data.incomes;
    this.form = new IncomeEditForm({ overrides });
  }

  public getConfig(incomeId: string) {
    const income = this.data.incomes.find(income => income.id === incomeId);
    const source = getAssociatedSource(income, this.data.waterfall.sources);
    return { income, source };
  }

  public restore(index: number) {
    const item = this.form.get('overrides').at(index);
    const initial = this.data.incomes.find(income => income.id === item.get('id').value);
    item.get('price').setValue(initial.price);
  }

  public confirm() {
    if (!this.form.valid) return;

    const overrides = this.form.get('overrides').value;
    const incomes = this.data.incomes.map(income => {
      const price = overrides.find(override => override.id === income.id)?.price;

      if (price === 0) {
        income.version[this.data.versionId] = { hidden: true, price };
      } else {
        income.version[this.data.versionId] = { price };
      }
      return income;
    });

    this.data.onConfirm(incomes);
    this.dialogRef.close(true);
  }

  public close() {
    this.dialogRef.close(false);
  }
}
