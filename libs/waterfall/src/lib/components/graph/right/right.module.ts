
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component
import { WaterfallGraphRightComponent } from './right.component';

// Blockframes
import { NumberPipeModule } from '@blockframes/utils/pipes';
import { RightHolderNamePipeModule } from '../../../pipes/rightholder-name.pipe';
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

    RightHolderNamePipeModule,
    GraphNodePipeModule,

    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  exports: [WaterfallGraphRightComponent],
})
export class WaterfallGraphRightModule { }
