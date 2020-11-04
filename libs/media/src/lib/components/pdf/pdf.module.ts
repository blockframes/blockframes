import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MediaViewerModule } from '../viewers/media-viewer.module';

import { PdfComponent } from './pdf.component';

@NgModule({
  declarations: [ PdfComponent ],
  imports: [
    CommonModule,
    FlexLayoutModule,

    MediaViewerModule,

    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  exports: [ PdfComponent ],
})
export class PdfModule { }
