
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component
import { WaterfallGraphVerticalComponent } from './vertical.component';

// Blockframes
import { NumberPipeModule } from '@blockframes/utils/pipes';
import { WaterfallGraphLevelModule } from '../level/level.module';
import { WaterfallGraphRightModule } from '../right/right.module';
import { GraphNodePipeModule } from '../../../pipes/graph-node-pipe';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [ WaterfallGraphVerticalComponent ],
  imports: [
    CommonModule,

    NumberPipeModule,
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
