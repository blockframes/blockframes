
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

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
