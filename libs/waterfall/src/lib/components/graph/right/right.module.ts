
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { MatTooltipModule } from '@angular/material/tooltip';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NumberPipeModule } from '@blockframes/utils/pipes';
import { RightHolderNamePipeModule } from '../../../pipes/rightholder-name.pipe';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';

import { WaterfallGraphRightComponent } from './right.component';


@NgModule({
  declarations: [ WaterfallGraphRightComponent ],
  imports: [
    CommonModule,
    NumberPipeModule,

    PricePerCurrencyModule,
    RightHolderNamePipeModule,

    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  exports: [ WaterfallGraphRightComponent ],
})
export class WaterfallGraphRightModule {}
