
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { WaterfallGraphSourceComponent } from './source.component';


@NgModule({
  declarations: [ WaterfallGraphSourceComponent ],
  imports: [
    CommonModule,

    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  exports: [ WaterfallGraphSourceComponent ],
})
export class WaterfallGraphSourceModule {}
