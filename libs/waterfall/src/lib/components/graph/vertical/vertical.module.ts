
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component
import { WaterfallGraphVerticalComponent } from './vertical.component';

// Blockframes
import { NumberPipeModule } from '@blockframes/utils/pipes';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';
import { WaterfallGraphLevelModule } from '../level/level.module';
import { WaterfallGraphRightModule } from '../right/right.module';
import { CanAddChildPipeModule } from '../../../pipes/can-add-child.pipe';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [ WaterfallGraphVerticalComponent ],
  imports: [
    CommonModule,

    NumberPipeModule,
    PricePerCurrencyModule,
    WaterfallGraphRightModule,
    WaterfallGraphLevelModule,
    CanAddChildPipeModule,

    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  exports: [ WaterfallGraphVerticalComponent ],
})
export class WaterfallGraphVerticalModule {}
