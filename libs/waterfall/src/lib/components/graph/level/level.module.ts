
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { MatTooltipModule } from '@angular/material/tooltip';

import { MatIconModule } from '@angular/material/icon';
import { NumberPipeModule } from '@blockframes/utils/pipes';

import { WaterfallGraphLevelComponent } from './level.component';


@NgModule({
  declarations: [ WaterfallGraphLevelComponent ],
  imports: [
    CommonModule,
    NumberPipeModule,

    MatIconModule,
    MatTooltipModule,
  ],
  exports: [ WaterfallGraphLevelComponent ],
})
export class WaterfallGraphLevelModule {}
