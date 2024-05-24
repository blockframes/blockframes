
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component
import { WaterfallGraphRightComponent } from './right.component';

// Blockframes
import { NumberPipeModule } from '@blockframes/utils/pipes';
import { RightHolderNamePipeModule } from '../../../pipes/rightholder-name.pipe';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';
import { GraphNodePipeModule } from '../../../pipes/graph-node-pipe';

// Material
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [WaterfallGraphRightComponent],
  imports: [
    CommonModule,
    NumberPipeModule,

    PricePerCurrencyModule,
    RightHolderNamePipeModule,
    GraphNodePipeModule,

    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  exports: [WaterfallGraphRightComponent],
})
export class WaterfallGraphRightModule { }
