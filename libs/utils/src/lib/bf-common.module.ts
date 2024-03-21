
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Blockframes
import { ToLabelModule, DatePipeModule, ToGroupLabelPipeModule, JoinPipeModule, MaxLengthModule } from './pipes';

@NgModule({
  imports: [
    CommonModule,

    ToLabelModule,
    DatePipeModule,
    ToGroupLabelPipeModule,
    JoinPipeModule,
    MaxLengthModule,
  ],
  exports: [
    CommonModule,
    
    ToLabelModule,
    DatePipeModule,
    ToGroupLabelPipeModule,
    JoinPipeModule,
    MaxLengthModule,
  ],
})
export class BfCommonModule { }
