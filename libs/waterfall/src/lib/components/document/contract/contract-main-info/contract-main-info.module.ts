// Angular
import { NgModule } from '@angular/core';
// Pages
import { ContractMainInfoComponent } from './contract-main-info.component';

// Blockframes
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';
import { RightHolderNamePipeModule } from '../../../../pipes/rightholder-name.pipe';
import { ContractPipeModule } from '@blockframes/contract/contract/pipe';
import { BfCommonModule } from '@blockframes/utils/bf-common.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';

@NgModule({
  declarations: [ContractMainInfoComponent],
  imports: [
    BfCommonModule,

    // Blockframes
    PricePerCurrencyModule,
    RightHolderNamePipeModule,
    ContractPipeModule,

    // Material
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  exports: [ContractMainInfoComponent]
})
export class ContractMainInfoModule { }
