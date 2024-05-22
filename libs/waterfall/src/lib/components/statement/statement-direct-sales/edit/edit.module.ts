// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Blockframes
import { StatementPeriodModule } from '../../statement-period/statement-period.module';
import { StatementHeaderModule } from '../../statement-header/statement-header.module';
import { ExpenseFormModule } from '../../../forms/expense-form/form.module';
import { IncomeFormModule } from '../../../forms/income-form/form.module';

// Components
import { StatementDirectSalesEditComponent } from './edit.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

@NgModule({
  declarations: [StatementDirectSalesEditComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    // Blockframes
    StatementPeriodModule,
    StatementHeaderModule,
    ExpenseFormModule,
    IncomeFormModule,

    // Material
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatSelectModule,
  ],
  exports: [StatementDirectSalesEditComponent]
})
export class StatementDirectSalesEditModule { }
