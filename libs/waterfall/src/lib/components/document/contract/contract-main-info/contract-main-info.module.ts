// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Pages
import { ContractMainInfoComponent } from './contract-main-info.component';

// Blockframes
import { ToLabelModule } from '@blockframes/utils/pipes';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';
import { RightHolderNamePipeModule } from '../../../../pipes/rightholder-name.pipe';
import { ContractPipeModule } from '@blockframes/contract/contract/pipe';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [ContractMainInfoComponent],
  imports: [
    CommonModule,

    // Blockframes
    ToLabelModule,
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
