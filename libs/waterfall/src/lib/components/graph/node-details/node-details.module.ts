
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WaterfallGraphNodeDetailsComponent } from './node-details.component';
import { GraphNodePipeModule } from '../../../pipes/graph-node-pipe';

// Blockframes
import { RightHolderNamePipeModule } from '../../../pipes/rightholder-name.pipe';
import { WaterfallConditionsReadOnlyModule } from '../conditions/read-only/read-only.module';

// Material
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  declarations: [WaterfallGraphNodeDetailsComponent],
  imports: [
    CommonModule,

    // Blockframes
    RightHolderNamePipeModule,
    WaterfallConditionsReadOnlyModule,
    GraphNodePipeModule,

    // Material
    MatTabsModule
  ],
  exports: [WaterfallGraphNodeDetailsComponent],
})
export class WaterfallGraphNodeDetailsModule { }
