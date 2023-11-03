
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { MatTooltipModule } from '@angular/material/tooltip';

import { NumberPipeModule } from '@blockframes/utils/pipes';

import { WaterfallGraphRightComponent } from './right.component';


@NgModule({
  declarations: [ WaterfallGraphRightComponent ],
  imports: [
    CommonModule,
    NumberPipeModule,

    MatTooltipModule,
  ],
  exports: [ WaterfallGraphRightComponent ],
})
export class WaterfallGraphRightModule {}
