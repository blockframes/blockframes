
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { WaterfallGraphSourceComponent } from './source.component';


@NgModule({
  declarations: [ WaterfallGraphSourceComponent ],
  imports: [
    CommonModule,

    MatIconModule,
    MatTooltipModule,
  ],
  exports: [ WaterfallGraphSourceComponent ],
})
export class WaterfallGraphSourceModule {}
