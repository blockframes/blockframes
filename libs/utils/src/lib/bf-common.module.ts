
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Blockframes
import { ToLabelModule, DatePipeModule } from './pipes';

@NgModule({
  imports: [
    CommonModule,

    ToLabelModule,
    DatePipeModule,
  ],
  exports: [CommonModule, ToLabelModule, DatePipeModule],
})
export class BfCommonModule { }
