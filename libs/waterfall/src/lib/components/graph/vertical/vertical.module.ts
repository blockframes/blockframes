
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { NumberPipeModule } from '@blockframes/utils/pipes';

import { WaterfallGraphLevelModule } from '../level/level.module';
import { WaterfallGraphRightModule } from '../right/right.module';
import { WaterfallGraphVerticalComponent } from './vertical.component';


@NgModule({
  declarations: [ WaterfallGraphVerticalComponent ],
  imports: [
    CommonModule,
    NumberPipeModule,
    WaterfallGraphRightModule,
    WaterfallGraphLevelModule,

    MatIconModule,
    MatButtonModule,
  ],
  exports: [ WaterfallGraphVerticalComponent ],
})
export class WaterfallGraphVerticalModule {}
