
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WaterfallGraphLevelComponent } from './level.component';

// Blockframes
import { NumberPipeModule } from '@blockframes/utils/pipes';

// Material
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [WaterfallGraphLevelComponent],
  imports: [
    CommonModule,

    NumberPipeModule,

    MatIconModule,
    MatTooltipModule,
  ],
  exports: [WaterfallGraphLevelComponent],
})
export class WaterfallGraphLevelModule { }
