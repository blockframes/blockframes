// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Blockframes
import { StatementPeriodModule } from '../../statement-period/statement-period.module';
import { StatementHeaderModule } from '../../statement-header/statement-header.module';
import { ExpenseFormModule } from '../../../forms/expense-form/form.module';
import { IncomeFormModule } from '../../../forms/income-form/form.module';

// Components
import { StatementDistributorEditComponent } from './edit.component';

// Material
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  declarations: [StatementDistributorEditComponent],
  imports: [
    CommonModule,

    // Blockframes
    StatementPeriodModule,
    StatementHeaderModule,
    ExpenseFormModule,
    IncomeFormModule,

    // Material
    MatTabsModule,
  ],
  exports: [StatementDistributorEditComponent]
})
export class StatementDistributorEditModule { }
