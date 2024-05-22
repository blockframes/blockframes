
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component
import { WaterfallGraphVerticalComponent } from './vertical.component';

// Blockframes
import { NumberPipeModule } from '@blockframes/utils/pipes';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';
import { WaterfallGraphLevelModule } from '../level/level.module';
import { WaterfallGraphRightModule } from '../right/right.module';
import { GraphNodePipeModule } from '../../../pipes/graph-node-pipe';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

@NgModule({
  declarations: [ WaterfallGraphVerticalComponent ],
  imports: [
    CommonModule,

    NumberPipeModule,
    PricePerCurrencyModule,
    WaterfallGraphRightModule,
    WaterfallGraphLevelModule,
    GraphNodePipeModule,

    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  exports: [ WaterfallGraphVerticalComponent ],
})
export class WaterfallGraphVerticalModule {}
