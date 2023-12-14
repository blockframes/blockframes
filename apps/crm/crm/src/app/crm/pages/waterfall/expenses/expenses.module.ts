import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ExpensesComponent } from './expenses.component';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';
import { RightHolderNamePipeModule } from '@blockframes/waterfall/pipes/rightholder-name.pipe';
import { ToLabelModule } from '@blockframes/utils/pipes';
import { ContractPipeModule } from '@blockframes/contract/contract/pipe';
import { ExpenseTypePipeModule } from '@blockframes/waterfall/pipes/expense-type';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@NgModule({
  declarations: [ExpensesComponent],
  imports: [
    CommonModule,

    TableModule,
    PricePerCurrencyModule,
    RightHolderNamePipeModule,
    ToLabelModule,
    ContractPipeModule,
    ExpenseTypePipeModule,

    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatSlideToggleModule,

    // remove
    RouterModule.forChild([{ path: '', component: ExpensesComponent }])
  ]
})
export class ExpensesModule { }
