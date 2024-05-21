
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WaterfallGraphLevelComponent } from './level.component';

// Blockframes
import { NumberPipeModule } from '@blockframes/utils/pipes';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';

// Material
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [WaterfallGraphLevelComponent],
  imports: [
    CommonModule,

    NumberPipeModule,
    PricePerCurrencyModule,

    MatIconModule,
    MatTooltipModule,
  ],
  exports: [WaterfallGraphLevelComponent],
})
export class WaterfallGraphLevelModule { }
