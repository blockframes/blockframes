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
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

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
  ],
  exports: [ContractMainInfoComponent]
})
export class ContractMainInfoModule { }
