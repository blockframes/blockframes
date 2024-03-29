import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Component
import { ContractsComponent } from './contracts.component';

// Blockframes
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';
import { RightHolderNamePipeModule } from '@blockframes/waterfall/pipes/rightholder-name.pipe';
import { ContractPipeModule } from '@blockframes/contract/contract/pipe';
import { BfCommonModule } from '@blockframes/utils/bf-common.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [ContractsComponent],
  imports: [
    BfCommonModule,

    TableModule,
    PricePerCurrencyModule,
    RightHolderNamePipeModule,
    ContractPipeModule,

    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatTooltipModule,

    RouterModule.forChild([{ path: '', component: ContractsComponent }])
  ]
})
export class ContractsModule { }
