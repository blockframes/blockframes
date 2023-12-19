
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NumberPipeModule } from '@blockframes/utils/pipes';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';

import { WaterfallGraphLabelComponent } from './label.component';


@NgModule({
  declarations: [ WaterfallGraphLabelComponent ],
  imports: [
    CommonModule,
    NumberPipeModule,

    PricePerCurrencyModule,
  ],
  exports: [ WaterfallGraphLabelComponent ],
})
export class WaterfallGraphLabelModule {}
