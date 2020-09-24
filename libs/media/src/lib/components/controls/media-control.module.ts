import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';

import { MediaControlComponent } from './media-control.component';
import { PdfControlComponent } from './pdf-control/pdf-control.component';

@NgModule({
  declarations: [
    MediaControlComponent,
    PdfControlComponent,
  ],
  imports: [
    CommonModule,

    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,

    FileNameModule,
  ],
  exports: [ MediaControlComponent ],
})
export class MediaControlModule {}
