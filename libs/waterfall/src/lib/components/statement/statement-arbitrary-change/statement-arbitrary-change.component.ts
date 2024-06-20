import { Component, ChangeDetectionStrategy, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  MaxPerIncome,
  Right,
  RightOverride,
  Statement,
  Waterfall,
  createRightOverride,
  isDirectSalesStatement,
  isProducerStatement
} from '@blockframes/model';
import { ArbitraryChangeForm, RightOverrideAmount } from '../../../form/arbitrary-change.form';

interface StatementArbitraryChangeData {
  mode?: 'view';
  right: Right;
  maxPerIncome: MaxPerIncome[];
  overrides: RightOverride[];
  statementId?: string;
  statements?: Statement[];
  waterfall: Waterfall;
  onConfirm?: (overrides: RightOverride[]) => void
}

@Component({
  selector: 'waterfall-statement-arbitrary-change',
  templateUrl: './statement-arbitrary-change.component.html',
  styleUrls: ['./statement-arbitrary-change.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementArbitraryChangeComponent implements OnInit {

  public form: ArbitraryChangeForm;
  public confirmationWord = $localize`SAVE`;
  public warnings: Record<string, { directSales: Statement[]; outgoing: Statement[]; }> = {};

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: StatementArbitraryChangeData,
    public dialogRef: MatDialogRef<StatementArbitraryChangeComponent>
  ) { }

  ngOnInit() {
    const overrides: RightOverrideAmount[] = this.data.maxPerIncome.map(maxPerIncome => {

      if (this.data.statementId && this.data.statements?.length) {
        /**
         * @dev If data.statements is provided (only for outgoing statements),
         * we check if there is already statements with payments declared on the same income.
         * 
         * DirectSales statements could be impacted.
         * (distributor statements also, but nothing displayed to user, so this change can be silent)
         * 
         * Sum of Outgoing statements rightPayments could exceed 100%.
         * 
         * For each impacted statement, right payments will be updated once statement is reported.
         * @see apps/waterfall/waterfall/src/app/dashboard/statement/view/view.component.ts
         */
        const parentDirectSalesStatements = this.data.statements
          .filter(s => isDirectSalesStatement(s))
          .filter(s => s.payments.right?.some(r => r.incomeIds.includes(maxPerIncome.income.id)));

        const outgoingStatements = this.data.statements
          .filter(s => s.id !== this.data.statementId)
          .filter(s => isProducerStatement(s))
          .filter(s => s.payments.right?.some(r => r.incomeIds.includes(maxPerIncome.income.id)));

        /**
         * @dev To check if statement is impacted, another instance of simulation should be created ?
         * This could be used to check if max > 100% and display a warning, additionnaly, max and theoric max should be displayed in the UI
         * Let's wait to know if this case can occur before implementing it.
         */

        if (parentDirectSalesStatements.length || outgoingStatements.length) {
          if (!this.warnings[maxPerIncome.income.id]) this.warnings[maxPerIncome.income.id] = { directSales: [], outgoing: [] };
          this.warnings[maxPerIncome.income.id].directSales = parentDirectSalesStatements;
          this.warnings[maxPerIncome.income.id].outgoing = outgoingStatements;
        }
      }

      const override = this.data.overrides.find(override => override.incomeId === maxPerIncome.income.id);
      return {
        incomeId: maxPerIncome.income.id,
        rightId: this.data.right.id,
        amount: maxPerIncome.current,
        comment: override?.comment ?? '',
        initial: override?.initial !== undefined ? override.initial : maxPerIncome.current,
      };
    });
    this.form = new ArbitraryChangeForm({ overrides });
  }

  public getConfig(incomeId: string) {
    return this.data.maxPerIncome.find(maxPerIncome => maxPerIncome.income.id === incomeId);
  }

  public restore(index: number) {
    const item = this.form.get('overrides').at(index);
    const initial = item.get('initial').value;
    item.get('amount').setValue(initial);
  }

  public confirm() {
    if (!this.form.valid) return;

    const overrides: RightOverrideAmount[] = this.form.value.overrides;

    const output = this.data.maxPerIncome.map(config => {
      if (config.max === 0) return;

      const override = overrides.find(override => override.incomeId === config.income.id);
      if (override.amount === override.initial) return; // No change

      const percent = override.amount === 0 ? 0 : (override.amount / config.max) * 100;
      if (percent === this.data.right.percent && override.amount === override.initial) return; // No change

      return createRightOverride({
        incomeId: config.income.id,
        rightId: this.data.right.id,
        percent,
        initial: override.initial,
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
