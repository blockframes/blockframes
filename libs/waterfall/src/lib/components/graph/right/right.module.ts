
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { MatTooltipModule } from '@angular/material/tooltip';

import { MatIconModule } from '@angular/material/icon';
import { NumberPipeModule } from '@blockframes/utils/pipes';

import { WaterfallGraphRightComponent } from './right.component';


@NgModule({
  declarations: [ WaterfallGraphRightComponent ],
  imports: [
    CommonModule,
    NumberPipeModule,

    MatIconModule,
    MatTooltipModule,
  ],
  exports: [ WaterfallGraphRightComponent ],
})
export class WaterfallGraphRightModule {}
