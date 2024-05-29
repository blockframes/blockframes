import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
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
