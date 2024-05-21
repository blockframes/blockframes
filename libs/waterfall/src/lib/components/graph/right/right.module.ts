
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
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

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
