import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { IncomesComponent } from './incomes.component';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';
import { ToLabelModule } from '@blockframes/utils/pipes';
import { ContractPipeModule } from '@blockframes/contract/contract/pipe';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [IncomesComponent],
  imports: [
    CommonModule,

    TableModule,
    PricePerCurrencyModule,
    ToLabelModule,
    ContractPipeModule,

    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatTooltipModule,

    // remove
    RouterModule.forChild([{ path: '', component: IncomesComponent }])
  ]
})
export class IncomesModule { }
