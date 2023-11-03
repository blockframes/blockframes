
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WaterfallGraphNodeComponent } from './node.component';
import { WaterfallGraphRightModule } from '../right/right.module';
import { WaterfallGraphSourceModule } from '../source/source.module';
import { WaterfallGraphVerticalModule } from '../vertical/vertical.module';
import { WaterfallGraphHorizontalModule } from '../horizontal/horizontal.module';


@NgModule({
  declarations: [ WaterfallGraphNodeComponent ],
  imports: [
    CommonModule,

    WaterfallGraphRightModule,
    WaterfallGraphSourceModule,
    WaterfallGraphVerticalModule,
    WaterfallGraphHorizontalModule,
  ],
  exports: [ WaterfallGraphNodeComponent ],
})
export class WaterfallGraphNodeModule {}
