
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { WaterfallGraphRightModule } from '../right/right.module';
import { WaterfallGraphVerticalModule } from '../vertical/vertical.module';
import { WaterfallGraphHorizontalComponent } from './horizontal.component';


@NgModule({
  declarations: [ WaterfallGraphHorizontalComponent ],
  imports: [
    CommonModule,

    WaterfallGraphRightModule,
    WaterfallGraphVerticalModule,
  ],
  exports: [ WaterfallGraphHorizontalComponent ],
})
export class WaterfallGraphHorizontalModule {}
