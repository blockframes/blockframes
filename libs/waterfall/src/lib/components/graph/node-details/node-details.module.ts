
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WaterfallGraphNodeDetailsComponent } from './node-details.component';
import { GraphNodePipeModule } from '../../../pipes/graph-node-pipe';

// Blockframes
import { RightHolderNamePipeModule } from '../../../pipes/rightholder-name.pipe';
import { WaterfallConditionsModule } from '../conditions/conditions.module';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';

// Material
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';

@NgModule({
  declarations: [WaterfallGraphNodeDetailsComponent],
  imports: [
    CommonModule,

    // Blockframes
    RightHolderNamePipeModule,
    WaterfallConditionsModule,
    GraphNodePipeModule,
    PricePerCurrencyModule,

    // Material
    MatTabsModule
  ],
  exports: [WaterfallGraphNodeDetailsComponent],
})
export class WaterfallGraphNodeDetailsModule { }
