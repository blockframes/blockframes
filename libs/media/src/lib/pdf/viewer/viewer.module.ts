import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PdfControlModule } from '../control/control.module';

import { PdfViewerComponent } from './viewer.component';

@NgModule({
  declarations: [ PdfViewerComponent ],
  imports: [
    CommonModule,
    FlexLayoutModule,

    PdfControlModule,

    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
  ],
  exports: [ PdfViewerComponent ],
})
export class PdfViewerModule { }
