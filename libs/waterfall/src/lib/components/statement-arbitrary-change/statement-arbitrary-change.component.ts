import { Component, ChangeDetectionStrategy, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Income, Right, RightOverride, WaterfallSource, createRightOverride, mainCurrency } from '@blockframes/model';
import { ArbitraryChangeForm, RightOverrideAmount } from '../../form/arbitrary-change.form';

interface StatementArbitraryChangeData {
  mode?: 'view';
  right: Right;
  maxPerIncome: { income: Income; max: number; current: number; source: WaterfallSource }[];
  overrides: RightOverride[];
  onConfirm?: (overrides: RightOverride[]) => void
}

@Component({
  selector: 'waterfall-statement-arbitrary-change',
  templateUrl: './statement-arbitrary-change.component.html',
  styleUrls: ['./statement-arbitrary-change.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementArbitraryChangeComponent implements OnInit {

  public mainCurrency = mainCurrency;
  public form: ArbitraryChangeForm;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: StatementArbitraryChangeData,
    public dialogRef: MatDialogRef<StatementArbitraryChangeComponent>
  ) { }

  ngOnInit() {
    const overrides = this.data.maxPerIncome.map(maxPerIncome => ({
      incomeId: maxPerIncome.income.id,
      rightId: this.data.right.id,
      amount: maxPerIncome.current,
      comment: this.data.overrides.find(override => override.incomeId === maxPerIncome.income.id)?.comment ?? '',
    }));
    this.form = new ArbitraryChangeForm({ overrides });
  }

  public getConfig(incomeId: string) {
    return this.data.maxPerIncome.find(maxPerIncome => maxPerIncome.income.id === incomeId);
  }

  public getInitialValue(incomeId: string) {
    const config = this.data.maxPerIncome.find(maxPerIncome => maxPerIncome.income.id === incomeId);
    return this.data.right.percent * config.max / 100;
  }

  public restore(index: number, incomeId: string) {
    this.form.get('overrides').at(index).get('amount').setValue(this.getInitialValue(incomeId));
  }

  public confirm() {
    if (!this.form.valid) return;

    const overrides: RightOverrideAmount[] = this.form.value.overrides;

    const output = this.data.maxPerIncome.map(config => {
      if (config.max === 0) return;

      const override = overrides.find(override => override.incomeId === config.income.id);
      if (config.current === override.amount) return; // No change

      const percent = override.amount === 0 ? 0 : (override.amount / config.max) * 100;
      if (percent === this.data.right.percent) return; // No change

      return createRightOverride({
        incomeId: config.income.id,
        rightId: this.data.right.id,
        percent,
        comment: override.comment,
      });

    }).filter(o => !!o);

    this.data.onConfirm(output);
    this.dialogRef.close(true);
  }

  public close() {
    this.dialogRef.close(false);
  }
}
