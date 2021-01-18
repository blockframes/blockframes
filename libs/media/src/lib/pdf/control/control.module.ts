import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { PdfControlComponent } from './control.component';

@NgModule({
  declarations: [
    PdfControlComponent,
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,

    MatButtonModule,
    MatIconModule,
  ],
  exports: [ PdfControlComponent ],
})
export class PdfControlModule {}
