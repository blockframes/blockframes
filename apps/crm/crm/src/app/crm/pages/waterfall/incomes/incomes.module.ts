import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { IncomesComponent } from './incomes.component';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';
import { BfCommonModule } from '@blockframes/utils/bf-common.module';
import { ContractPipeModule } from '@blockframes/contract/contract/pipe';
import { VersionSelectorModule } from '@blockframes/waterfall/components/version/version-selector/version-selector.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [IncomesComponent],
  imports: [
    BfCommonModule,

    TableModule,
    PricePerCurrencyModule,
    ContractPipeModule,
    VersionSelectorModule,

    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatTooltipModule,

    // remove
    RouterModule.forChild([{ path: '', component: IncomesComponent }])
  ]
})
export class IncomesModule { }
