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
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';

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
    MatDialogModule,

    RouterModule.forChild([{ path: '', component: ContractsComponent }])
  ]
})
export class ContractsModule { }
