
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NumberPipeModule } from '@blockframes/utils/pipes';

import { WaterfallGraphLabelComponent } from './label.component';


@NgModule({
  declarations: [ WaterfallGraphLabelComponent ],
  imports: [
    CommonModule,
    NumberPipeModule,
  ],
  exports: [ WaterfallGraphLabelComponent ],
})
export class WaterfallGraphLabelModule {}
