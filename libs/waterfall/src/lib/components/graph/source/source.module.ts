
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTooltipModule } from '@angular/material/tooltip';

import { WaterfallGraphSourceComponent } from './source.component';


@NgModule({
  declarations: [ WaterfallGraphSourceComponent ],
  imports: [
    CommonModule,

    MatTooltipModule,
  ],
  exports: [ WaterfallGraphSourceComponent ],
})
export class WaterfallGraphSourceModule {}
